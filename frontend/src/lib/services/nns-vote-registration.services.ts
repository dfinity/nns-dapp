import { governanceApiService } from "$lib/api-services/governance.api-service";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  manageVotesRegistration,
  processRegisterVoteErrors,
  updateVoteRegistrationToastMessage,
  voteRegistrationByProposal,
} from "$lib/services/vote-registration.services";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import { proposalsStore } from "$lib/stores/proposals.store";
import { toastsError } from "$lib/stores/toasts.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import { updateNeuronsVote } from "$lib/utils/neuron.utils";
import {
  mapProposalInfo as mapNnsProposal,
  updateProposalVote,
} from "$lib/utils/proposals.utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { assertNonNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { loadProposal } from "./$public/proposals.services";
import { getAuthenticatedIdentity } from "./auth.services";
import { listNeurons } from "./neurons.services";

/**
 * Makes multiple registerVote calls (1 per neuronId).
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
  const proposalType = mapNnsProposal(proposalInfo).topic ?? "";

  await manageVotesRegistration({
    universeCanisterId: OWN_CANISTER_ID,
    neuronIdStrings: neuronIds.map(String),
    proposalIdString: `${proposalInfo.id}`,
    proposalType,
    vote,
    registerNeuronVotes: async (toastId: symbol) => {
      // make register vote calls (one per neuron)
      await registerNnsNeuronsVote({
        neuronIds,
        proposalInfo,
        vote,
        updateProposalContext,
        toastId,
      });
    },
    postRegistration: async () => {
      // reload and replace proposal and neurons (`update` call) to display the actual backend state
      const updatedProposalInfo = await updateAfterNnsVoteRegistration(
        proposalInfo.id as ProposalId
      );

      // the one that was called
      proposalsStore.replaceProposals([updatedProposalInfo]);
      updateProposalContext(updatedProposalInfo);
    },
  });
};

/** Update voting store state and toast message text */
const updateToastAfterNeuronRegistration = ({
  neuronId,
  proposalId,
  toastId,
}: {
  neuronId: NeuronId;
  proposalId: ProposalId;
  toastId: symbol;
}) => {
  const proposalIdString = `${proposalId}`;
  const { vote, neuronIdStrings } = voteRegistrationByProposal({
    proposalIdString,
    universeCanisterId: OWN_CANISTER_ID,
  });
  const proposalInfo = get(proposalsStore).proposals.find(
    ({ id }) => id === proposalId
  );
  const proposalType = nonNullish(proposalInfo)
    ? mapNnsProposal(proposalInfo).type ?? ""
    : "";

  voteRegistrationStore.addSuccessfullyVotedNeuronId({
    proposalIdString,
    neuronIdString: `${neuronId}`,
    canisterId: OWN_CANISTER_ID,
  });

  updateVoteRegistrationToastMessage({
    toastId,
    proposalIdString,
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

/** Optimistically update the neuron and proposal state after successful vote registration */
const updateOptimisticStateAfterNeuronVote = ({
  neuronId,
  proposalInfo,
  updateProposalContext,
}: {
  neuronId: NeuronId;
  proposalInfo: ProposalInfo;
  updateProposalContext: (proposal: ProposalInfo) => void;
}) => {
  const proposalIdString = `${proposalInfo.id}`;
  const { vote } = voteRegistrationByProposal({
    proposalIdString,
    universeCanisterId: OWN_CANISTER_ID,
  });
  const $definedNeuronsStore = get(definedNeuronsStore);
  const originalNeuron = $definedNeuronsStore.find(
    ({ neuronId: id }) => id === neuronId
  );
  assertNonNullish(proposalInfo, `Proposal (${proposalIdString}) not found`);

  // TODO: remove after live testing. In theory it should be always defined here.
  assertNonNullish(originalNeuron, `Neuron ${neuronId} not defined`);

  // Optimistically update neuron vote state
  const votingNeuron = updateNeuronsVote({
    neuron: originalNeuron,
    vote,
    proposalId: proposalInfo.id as bigint,
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
};

/**
 * Make governance registerVote api call per neuronId and handles update errors
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
  const { id } = proposalInfo;
  const proposalId = id as ProposalId;
  const proposalType = mapNnsProposal(proposalInfo).topic ?? "";

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
          .then(() => {
            updateToastAfterNeuronRegistration({
              neuronId,
              proposalId,
              toastId,
            });
            updateOptimisticStateAfterNeuronVote({
              neuronId,
              proposalInfo,
              updateProposalContext,
            });
          })
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
      proposalType,
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
