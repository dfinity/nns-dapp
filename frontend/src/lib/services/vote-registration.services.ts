import { governanceApiService } from "$lib/api-services/governance.api-service";
import { registerVote as registerSnsVoteApi } from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { getSnsNeuronIdentity } from "$lib/services/sns-neurons.services";
import { i18n } from "$lib/stores/i18n";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import {
  toastsError,
  toastsHide,
  toastsShow,
  toastsUpdate,
} from "$lib/stores/toasts.store";
import {
  voteRegistrationStore,
  type VoteRegistrationStoreEntry,
} from "$lib/stores/vote-registration.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { updateNeuronsVote } from "$lib/utils/neuron.utils";
import {
  mapProposalInfo as mapNnsProposal,
  registerVoteErrorDetails,
  updateProposalVote,
} from "$lib/utils/proposals.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mapProposalInfo as mapSnsProposal } from "$lib/utils/sns-proposals.utils";
import { keyOf } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import {
  Topic,
  Vote,
  type NeuronId,
  type ProposalId,
  type ProposalInfo,
} from "@dfinity/nns";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsProposalData,
  SnsVote,
} from "@dfinity/sns";
import {
  assertNonNullish,
  fromDefinedNullable,
  nonNullish,
} from "@dfinity/utils";
import { get } from "svelte/store";
import { loadProposal } from "./$public/proposals.services";
import { getAuthenticatedIdentity } from "./auth.services";
import { listNeurons } from "./neurons.services";

/**
 * Create Makes multiple registerVote calls (1 per neuronId).
 *
 * In order to improve UX optimistic UI update is used:
 * after every successful neuron vote registration (`registerVote`) we mock the data (both proposal and voted neuron)and update the stores with optimistic values.
 */
export const registerNnsVotes = async ({
  neuronIds,
  proposalInfo,
  vote,
  reloadProposalCallback: updateProposalContext,
}: {
  neuronIds: NeuronId[];
  proposalInfo: ProposalInfo;
  vote: Vote;
  reloadProposalCallback: (proposalInfo: ProposalInfo) => void;
}): Promise<void> => {
  // keyOf({ obj: get(i18n).topics, key: Topic[proposalInfo.topic] })

  const proposalType = mapNnsProposal(proposalInfo).topic ?? "";

  await registerVotes({
    universeCanisterId: OWN_CANISTER_ID,
    neuronIdStrings: neuronIds.map(String),
    proposalIdString: `${proposalInfo.id}`,
    proposalType,
    vote,
    registerVotes: async (toastId: symbol) => {
      // make register vote calls (one per neuron)
      await registerNnsNeuronsVote({
        neuronIds,
        proposalInfo,
        vote,
        updateProposalContext,
        toastId,
      });
    },
    updateProposals: async () => {
      // reload and replace proposal and neurons (`update` call) to display the actual backend state
      const updatedProposalInfo = await updateAfterNnsVoteRegistration(
        proposalInfo.id as ProposalId
      );

      proposalsStore.replaceProposals([updatedProposalInfo]);
      updateProposalContext(updatedProposalInfo);
    },
  });
};

/**
 * Create Makes multiple registerVote calls (1 per neuronId).
 *
 * In order to improve UX optimistic UI update is used:
 * after every successful neuron vote registration (`registerVote`) we mock the data (both proposal and voted neuron)and update the stores with optimistic values.
 */
export const registerSnsVotes = async ({
  universeCanisterId,
  neurons,
  proposal,
  vote,
  reloadProposalCallback: updateProposalContext,
}: {
  universeCanisterId: UniverseCanisterId;
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  vote: SnsVote;
  reloadProposalCallback: (proposal: SnsProposalData) => void;
}): Promise<void> => {
  const nsFunctions: SnsNervousSystemFunction[] =
    get(snsFunctionsStore)[universeCanisterId.toText()]?.nsFunctions;
  const proposalType =
    mapSnsProposal({ proposalData: proposal, nsFunctions }).type ?? "";

  await registerVotes({
    universeCanisterId,
    neuronIdStrings: neurons.map(String),
    proposalIdString: fromDefinedNullable(proposal.id).id.toString(),
    proposalType,
    vote,
    registerVotes: async (toastId: symbol) => {
      // make register vote calls (one per neuron)
      await registerSnsNeuronsVote({
        universeCanisterId,
        neurons,
        proposal,
        vote,
        updateProposalContext,
        toastId,
      });
    },
    updateProposals: async () => {
      // TODO(sns-voting): reload proposal and replace in the store
      // The store is not yet implemented
      // // reload and replace proposal and neurons (`update` call) to display the actual backend state
      // const updatedProposalInfo = await updateAfterNnsVoteRegistration(
      //   proposal.id as ProposalId
      // );
      // proposalsStore.replaceProposals([updatedProposalInfo]);
      // updateProposalContext(updatedProposalInfo);
    },
  });
};

/**
 * Reflects vote registration status with a toast messages
 * (regardless of neuron type nns/sns)
 */
const registerVotes = async ({
  universeCanisterId,
  neuronIdStrings,
  proposalIdString,
  proposalType,
  vote,
  registerVotes,
  updateProposals,
}: {
  universeCanisterId: UniverseCanisterId;
  neuronIdStrings: string[];
  proposalIdString: string;
  proposalType: string;
  vote: Vote | SnsVote;
  registerVotes: (toastId: symbol) => Promise<void>;
  updateProposals: () => Promise<void>;
}): Promise<void> => {
  try {
    const toastId = createRegisterVotesToast({
      vote,
      proposalIdString,
      proposalType,
      neuronIdStrings,
    });
    voteRegistrationStore.add({
      vote,
      proposalIdString,
      neuronIdStrings,
      canisterId: universeCanisterId,
    });

    await registerVotes(toastId);

    voteRegistrationStore.updateStatus({
      proposalIdString,
      status: "post-update",
      canisterId: universeCanisterId,
    });

    // update the toast state (voting -> updating the data)
    const { successfullyVotedNeuronIdStrings } = voteRegistrationByProposal({
      proposalIdString,
      universeCanisterId,
    });
    updateVoteRegistrationToastMessage({
      toastId,
      proposalIdString,
      proposalType,
      neuronIdStrings,
      successfullyVotedNeuronIdStrings,
      registrationDone: true,
      vote,
    });

    await updateProposals();

    // cleanup
    toastsHide(toastId);
    voteRegistrationStore.remove({
      proposalIdString,
      canisterId: universeCanisterId,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsError({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

const createRegisterVotesToast = ({
  vote,
  proposalIdString,
  proposalType,
  neuronIdStrings,
}: {
  vote: Vote | SnsVote;
  proposalIdString: string;
  proposalType: string;
  neuronIdStrings: string[];
}): symbol => {
  const $i18n = get(i18n);
  const totalNeurons = neuronIdStrings.length;
  const status = replacePlaceholders(
    $i18n.proposal_detail__vote.vote_status_registering,
    {
      $completed: `0`,
      $amount: `${totalNeurons}`,
    }
  );

  return toastsShow({
    labelKey:
      vote === Vote.Yes
        ? "proposal_detail__vote.vote_adopt_in_progress"
        : "proposal_detail__vote.vote_reject_in_progress",
    level: "info",
    spinner: true,
    substitutions: {
      $proposalId: proposalIdString,
      $topic: proposalType,
      $status: status,
    },
  });
};

const voteRegistrationByProposal = ({
  universeCanisterId,
  proposalIdString,
}: {
  universeCanisterId: UniverseCanisterId;
  proposalIdString: string;
}): VoteRegistrationStoreEntry => {
  const registration = get(voteRegistrationStore).registrations[
    universeCanisterId.toText()
  ].find(({ proposalIdString: id }) => id === proposalIdString);

  assertNonNullish(registration);

  return registration;
};

const nnsNeuronRegistrationComplete = ({
  neuronId,
  proposalId,
  updateProposalContext,
  toastId,
}: {
  neuronId: NeuronId;
  proposalId: ProposalId;
  updateProposalContext: (proposal: ProposalInfo) => void;
  toastId: symbol;
}) => {
  const proposalIdString = `${proposalId}`;
  const { vote, neuronIdStrings } = voteRegistrationByProposal({
    proposalIdString,
    universeCanisterId: OWN_CANISTER_ID,
  });
  const $definedNeuronsStore = get(definedNeuronsStore);
  const originalNeuron = $definedNeuronsStore.find(
    ({ neuronId: id }) => id === neuronId
  );
  const proposalInfo = get(proposalsStore).proposals.find(
    ({ id }) => id === proposalId
  );
  const proposalType = nonNullish(proposalInfo)
    ? mapNnsProposal(proposalInfo).type ?? ""
    : "";
  assertNonNullish(proposalInfo, `Proposal (${proposalIdString}) not found`);

  // TODO: remove after live testing. In theory it should be always defined here.
  assertNonNullish(originalNeuron, `Neuron ${neuronId} not defined`);

  voteRegistrationStore.addSuccessfullyVotedNeuronId({
    proposalIdString,
    neuronIdString: `${neuronId}`,
    canisterId: OWN_CANISTER_ID,
  });

  // Optimistically update neuron vote state
  const votingNeuron = updateNeuronsVote({
    neuron: originalNeuron,
    vote,
    proposalId,
  });
  neuronsStore.replaceNeurons([votingNeuron]);

  // Optimistically update proposal vote state
  const votingProposal = updateProposalVote({
    proposalInfo,
    neuron: votingNeuron,
    vote,
  });
  // update proposal list with voted proposal to make "hide open" filter work (because of the changes in ballots)
  proposalsStore.replaceProposals([votingProposal]);

  // Update proposal context store
  updateProposalContext(votingProposal);

  updateVoteRegistrationToastMessage({
    toastId,
    proposalIdString: `${proposalInfo.id}`,
    proposalType,
    neuronIdStrings,
    registrationDone: false,
    // use the most actual value
    successfullyVotedNeuronIdStrings: voteRegistrationByProposal({
      proposalIdString,
      universeCanisterId: OWN_CANISTER_ID,
    }).successfullyVotedNeuronIdStrings,
    vote,
  });
};

const snsNeuronRegistrationComplete = ({
  universeCanisterId,
  neuron,
  proposal,
  updateProposalContext,
  toastId,
}: {
  universeCanisterId: UniverseCanisterId;
  neuron: SnsNeuron;
  proposal: SnsProposalData;
  updateProposalContext: (proposal: SnsProposalData) => void;
  toastId: symbol;
}) => {
  const proposalIdString = fromDefinedNullable(proposal.id).id.toString();
  const { vote, neuronIdStrings } = voteRegistrationByProposal({
    proposalIdString,
    universeCanisterId,
  });
  const nsFunctions: SnsNervousSystemFunction[] =
    get(snsFunctionsStore)[universeCanisterId.toText()]?.nsFunctions;
  const proposalType =
    mapSnsProposal({ proposalData: proposal, nsFunctions }).type ?? "";

  // TODO(sns-voting): fake registration (see nnsNeuronRegistrationComplete)

  voteRegistrationStore.addSuccessfullyVotedNeuronId({
    proposalIdString,
    neuronIdString: getSnsNeuronIdAsHexString(neuron),
    canisterId: universeCanisterId,
  });

  // TODO(sns-voting): Optimistically update neuron vote state
  // ... neuronsStore.replaceNeurons([votingNeuron]);

  // TODO(sns-voting): Optimistically update proposal vote state
  // ... proposalsStore.replaceProposals([votingProposal]);

  updateProposalContext(proposal);

  updateVoteRegistrationToastMessage({
    toastId,
    proposalIdString,
    proposalType,
    neuronIdStrings,
    registrationDone: false,
    // use the most actual value
    successfullyVotedNeuronIdStrings: voteRegistrationByProposal({
      proposalIdString,
      universeCanisterId,
    }).successfullyVotedNeuronIdStrings,
    vote,
  });
};

/** Reflects vote registration in a toast message */
const updateVoteRegistrationToastMessage = ({
  toastId,
  proposalIdString,
  proposalType,
  neuronIdStrings,
  successfullyVotedNeuronIdStrings,
  registrationDone,
  vote,
}: {
  toastId: symbol;
  proposalIdString: string;
  proposalType: string;
  neuronIdStrings: string[];
  successfullyVotedNeuronIdStrings: string[];
  registrationDone: boolean;
  vote: Vote | SnsVote;
}) => {
  const $i18n = get(i18n);
  const totalNeurons = neuronIdStrings.length;
  const completeNeurons = successfullyVotedNeuronIdStrings.length;
  const status = registrationDone
    ? $i18n.proposal_detail__vote.vote_status_updating
    : replacePlaceholders($i18n.proposal_detail__vote.vote_status_registering, {
        $completed: `${completeNeurons}`,
        $amount: `${totalNeurons}`,
      });

  toastsUpdate({
    id: toastId,
    content: {
      labelKey:
        vote === Vote.Yes
          ? "proposal_detail__vote.vote_adopt_in_progress"
          : "proposal_detail__vote.vote_reject_in_progress",
      level: "info",
      spinner: true,
      substitutions: {
        $proposalId: proposalIdString,
        $topic: proposalType,
        $status: status,
      },
    },
  });
};

/**
 * Make governance api call per neuronId and handles update errors
 */
const registerNnsNeuronsVote = async ({
  neuronIds,
  proposalInfo,
  vote,
  updateProposalContext,
  toastId,
}: {
  neuronIds: NeuronId[];
  proposalInfo: ProposalInfo;
  vote: Vote;
  updateProposalContext: (proposal: ProposalInfo) => void;
  toastId: symbol;
}) => {
  const identity: Identity = await getAuthenticatedIdentity();
  const { id, topic } = proposalInfo;
  const proposalId = id as ProposalId;

  try {
    const requests = neuronIds.map(
      (neuronId: NeuronId): Promise<void> =>
        governanceApiService
          .registerVote({
            neuronId,
            vote,
            proposalId,
            identity,
          })
          // call it only after successful registration
          .then(() =>
            nnsNeuronRegistrationComplete({
              neuronId,
              proposalId,
              updateProposalContext,
              toastId,
            })
          )
      // )
    );

    logWithTimestamp(`Registering [${neuronIds.map(hashCode)}] votes call...`);

    const registerVoteResponses = await Promise.allSettled(requests);

    logWithTimestamp(
      `Registering [${neuronIds.map(hashCode)}] votes complete.`
    );

    processRegisterVoteErrors({
      registerVoteResponses,
      neuronIdStrings: neuronIds.map(String),
      proposalIdString: `${proposalId}`,
      topic,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsError({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

/**
 * Make governance api call per neuronId and handles update errors
 */
const registerSnsNeuronsVote = async ({
  universeCanisterId,
  neurons,
  proposal,
  vote,
  updateProposalContext,
  toastId,
}: {
  universeCanisterId: UniverseCanisterId;
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  vote: SnsVote;
  updateProposalContext: (proposal: SnsProposalData) => void;
  toastId: symbol;
}) => {
  const identity = await getSnsNeuronIdentity();
  const proposalId = fromDefinedNullable(proposal.id);

  try {
    const requests = neurons.map(
      (neuron): Promise<void> =>
        // new Promise((r) => setTimeout(r, Math.random() * 8000))
        registerSnsVoteApi({
          rootCanisterId: universeCanisterId,
          identity,
          neuronId: fromDefinedNullable(neuron.id),
          proposalId,
          vote,
        })
          // call it only after successful registration
          .then(() =>
            snsNeuronRegistrationComplete({
              universeCanisterId: universeCanisterId,
              neuron,
              proposal,
              updateProposalContext,
              toastId,
            })
          )
    );

    logWithTimestamp(
      `Registering [${neurons.map(getSnsNeuronIdAsHexString)}] votes call...`
    );

    const registerVoteResponses = await Promise.allSettled(requests);

    logWithTimestamp(
      `Registering [${neurons.map(getSnsNeuronIdAsHexString)}] votes complete.`
    );

    processRegisterVoteErrors({
      registerVoteResponses,
      neuronIdStrings: neurons.map(String),
      proposalIdString: proposalId.id.toString(),
      topic: Topic.Unspecified,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsError({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};

const processRegisterVoteErrors = ({
  registerVoteResponses,
  neuronIdStrings,
  proposalIdString,
  topic,
}: {
  registerVoteResponses: PromiseSettledResult<void>[];
  neuronIdStrings: string[];
  proposalIdString: string;
  topic: Topic;
}) => {
  const rejectedResponses = registerVoteResponses.filter(
    (response: PromiseSettledResult<void>) => {
      const { status } = response;

      // We ignore the error "Neuron already voted on proposal." - i.e. we consider it as a valid response
      // 1. the error truly means the neuron has already voted.
      // 2. if user has for example two neurons with one neuron (B) following another neuron (A). Then if user select both A and B to cast a vote, A will first vote for itself and then vote for the followee B. Then Promise.allSettled above process next neuron B and try to vote again but this vote won't succeed, because it has already been registered by A.
      // TODO(L2-465): discuss with Governance team to either turn the error into a valid response (or warning) with comment or to throw a unique identifier for this particular error.
      const hasAlreadyVoted: boolean =
        "reason" in response &&
        response.reason?.detail?.error_message ===
          "Neuron already voted on proposal.";

      return status === "rejected" && !hasAlreadyVoted;
    }
  );

  if (rejectedResponses.length > 0) {
    const details: string[] = registerVoteErrorDetails({
      responses: registerVoteResponses,
      neuronIdStrings,
    });
    const $i18n = get(i18n);

    toastsShow({
      labelKey: "error.register_vote",
      level: "error",
      substitutions: {
        $proposalId: proposalIdString,
        $topic: keyOf({ obj: $i18n.topics, key: Topic[topic] }),
      },
      detail: details.join(", "),
    });
  }
};

/**
 * Reload proposals and neurons
 * @param proposalId
 */
const updateAfterNnsVoteRegistration = async (
  proposalId: ProposalId
): Promise<ProposalInfo> => {
  const reloadProposal = async () =>
    new Promise<ProposalInfo>((setProposal) =>
      loadProposal({
        proposalId,
        setProposal,
        // it will take longer but the query could contain not updated data (e.g. latestTally, votingPower on testnet)
        strategy: "update",
      })
    );

  return Promise.all([
    listNeurons({
      strategy: "update",
    }),
    reloadProposal(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ]).then(([_, proposal]) => proposal);
};
