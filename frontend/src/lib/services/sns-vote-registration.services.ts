import { registerVote as registerSnsVoteApi } from "$lib/api/sns-governance.api";
import { getSnsNeuronIdentity } from "$lib/services/sns-neurons.services";
import {
  manageVotesRegistration,
  processRegisterVoteErrors,
  updateVoteRegistrationToastMessage,
  voteRegistrationByProposal,
} from "$lib/services/vote-registration.services";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { toastsError } from "$lib/stores/toasts.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { mapProposalInfo as mapSnsProposal } from "$lib/utils/sns-proposals.utils";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsProposalData,
  SnsVote,
} from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { get } from "svelte/store";

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

  await manageVotesRegistration({
    universeCanisterId,
    neuronIdStrings: neurons.map(String),
    proposalIdString: fromDefinedNullable(proposal.id).id.toString(),
    proposalType,
    vote,
    registerNeuronVotes: async (toastId: symbol) => {
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
    postRegistration: async () => {
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
  const nsFunctions: SnsNervousSystemFunction[] =
    get(snsFunctionsStore)[universeCanisterId.toText()]?.nsFunctions;
  const proposalType =
    mapSnsProposal({ proposalData: proposal, nsFunctions }).type ?? "";
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
      proposalType: proposalType,
    });
  } catch (err: unknown) {
    console.error("vote unknown:", err);

    toastsError({
      labelKey: "error.register_vote_unknown",
      err,
    });
  }
};
