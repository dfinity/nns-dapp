import { governanceApiService } from "$lib/api-services/governance.api-service";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { i18n } from "$lib/stores/i18n";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
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
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { updateNeuronsVote } from "$lib/utils/neuron.utils";
import {
  registerVoteErrorDetails,
  updateProposalVote,
} from "$lib/utils/proposals.utils";
import { keyOf } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import {
  Topic,
  Vote,
  type NeuronId,
  type ProposalId,
  type ProposalInfo,
} from "@dfinity/nns";
import { assertNonNullish } from "@dfinity/utils";
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
// TODO(sns-voting): add registerSnsVotes
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
  await registerVotes({
    neuronIdStrings: neuronIds.map(String),
    proposalIdString: `${proposalInfo.id}`,
    proposalTopic: proposalInfo.topic,
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
 * Reflects vote registration status with a toast messages
 * (regardless of neuron type nns/sns)
 */
const registerVotes = async ({
  neuronIdStrings,
  proposalIdString,
  proposalTopic,
  vote,
  registerVotes,
  updateProposals,
}: {
  neuronIdStrings: string[];
  proposalIdString: string;
  proposalTopic: Topic;
  vote: Vote;
  registerVotes: (toastId: symbol) => Promise<void>;
  updateProposals: () => Promise<void>;
}): Promise<void> => {
  try {
    const toastId = createRegisterVotesToast({
      vote,
      proposalIdString,
      proposalTopic,
      neuronIdStrings,
    });
    voteRegistrationStore.add({
      vote,
      proposalIdString,
      neuronIdStrings,
      canisterId: OWN_CANISTER_ID,
    });

    await registerVotes(toastId);

    voteRegistrationStore.updateStatus({
      proposalIdString,
      status: "post-update",
      canisterId: OWN_CANISTER_ID,
    });

    // update the toast state (voting -> updating the data)
    const { successfullyVotedNeuronIdStrings } =
      nnsVoteRegistrationByProposal(proposalIdString);
    updateVoteRegistrationToastMessage({
      toastId,
      proposalIdString,
      proposalTopic,
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
      canisterId: OWN_CANISTER_ID,
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
  proposalTopic,
  neuronIdStrings,
}: {
  vote: Vote;
  proposalIdString: string;
  proposalTopic: Topic;
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
      $topic: keyOf({ obj: $i18n.topics, key: Topic[proposalTopic] }),
      $status: status,
    },
  });
};

const nnsVoteRegistrationByProposal = (
  proposalIdString: string
): VoteRegistrationStoreEntry => {
  const registration = get(voteRegistrationStore).registrations[
    OWN_CANISTER_ID.toText()
  ].find(({ proposalIdString: id }) => id === proposalIdString);

  assertNonNullish(registration);

  return registration;
};

// TODO(sns-voting): create `snsNeuronRegistrationComplete`
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
  const { vote, neuronIdStrings } =
    nnsVoteRegistrationByProposal(proposalIdString);
  const $definedNeuronsStore = get(definedNeuronsStore);
  const originalNeuron = $definedNeuronsStore.find(
    ({ neuronId: id }) => id === neuronId
  );
  const proposalInfo = get(proposalsStore).proposals.find(
    ({ id }) => id === proposalId
  );
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
    proposalTopic: proposalInfo.topic,
    neuronIdStrings,
    registrationDone: false,
    // use the most actual value
    successfullyVotedNeuronIdStrings:
      nnsVoteRegistrationByProposal(proposalIdString)
        .successfullyVotedNeuronIdStrings,
    vote,
  });
};

/** Reflects vote registration in a toast message */
const updateVoteRegistrationToastMessage = ({
  toastId,
  proposalIdString,
  proposalTopic,
  neuronIdStrings,
  successfullyVotedNeuronIdStrings,
  registrationDone,
  vote,
}: {
  toastId: symbol;
  proposalIdString: string;
  proposalTopic: Topic;
  neuronIdStrings: string[];
  successfullyVotedNeuronIdStrings: string[];
  registrationDone: boolean;
  vote: Vote;
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
        $topic: keyOf({ obj: $i18n.topics, key: Topic[proposalTopic] }),
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
