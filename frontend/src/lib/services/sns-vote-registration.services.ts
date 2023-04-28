import { registerVote as registerSnsVoteApi } from "$lib/api/sns-governance.api";
import { getSnsNeuronIdentity } from "$lib/services/sns-neurons.services";
import {
  manageVotesRegistration,
  processRegisterVoteErrors,
  updateVoteRegistrationToastMessage,
  voteRegistrationByProposal,
} from "$lib/services/vote-registration.services";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { toastsError } from "$lib/stores/toasts.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  mapProposalInfo as mapSnsProposal,
  toSnsVote,
} from "$lib/utils/sns-proposals.utils";
import type {
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsProposalData,
  SnsVote,
} from "@dfinity/sns";
import type { Ballot } from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable } from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Makes multiple registerVote calls (1 per neuronId).
 *
 * In order to improve UX optimistic UI update is used:
 * after every successful neuron vote registration (`registerVote`) we mock the data (both proposal and voted neuron)and update the stores with optimistic values.
 */
export const registerSnsVotes = async ({
  universeCanisterId,
  neurons,
  proposal,
  vote,
  updateProposalCallback: updateProposalContext,
}: {
  universeCanisterId: UniverseCanisterId;
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  vote: SnsVote;
  updateProposalCallback: (proposal: SnsProposalData) => void;
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
      const optimisticProposal = proposalAfterVote({
        proposal,
        neurons,
        vote,
      });

      // replace proposal in the store to make sns proposal filtering work (not yet implemented)
      snsProposalsStore.addProposals({
        rootCanisterId: universeCanisterId,
        proposals: [optimisticProposal],
        certified: false,
        completed: true,
      });
    },
  });
};

/** Update voting store state and toast message text */
const snsNeuronRegistrationComplete = async ({
  universeCanisterId,
  neuron,
  proposal,
  toastId,
}: {
  universeCanisterId: UniverseCanisterId;
  neuron: SnsNeuron;
  proposal: SnsProposalData;
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

  voteRegistrationStore.addSuccessfullyVotedNeuronId({
    proposalIdString,
    neuronIdString: getSnsNeuronIdAsHexString(neuron),
    canisterId: universeCanisterId,
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
      universeCanisterId,
    }).successfullyVotedNeuronIdStrings,
    vote,
  });
};

/** Optimistically update proposal ballots (how they expected to be after successful voting) */
const proposalAfterVote = ({
  proposal,
  neurons,
  vote,
}: {
  proposal: SnsProposalData;
  neurons: SnsNeuron[];
  vote: SnsVote;
}): SnsProposalData => {
  const votedNeuronsIds = new Set(neurons.map(getSnsNeuronIdAsHexString));
  const optimisticBallots: Array<[string, Ballot]> = Array.from(
    votedNeuronsIds
  ).map((id) => [
    id,
    {
      vote,
      cast_timestamp_seconds: BigInt(Math.round(Date.now() / 1000)),
      // TODO(sns-voting): get voting power if needed
      voting_power: 0n,
    } as Ballot,
  ]);
  return {
    ...proposal,
    ballots: [
      // not voted ballots
      ...proposal.ballots.filter(([id]) => !votedNeuronsIds.has(id)),
      // voted ballots
      ...optimisticBallots,
    ],
  };
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
  const successfulVotedNeurons: SnsNeuron[] = [];
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
          .then(async () => {
            successfulVotedNeurons.push(neuron);

            snsNeuronRegistrationComplete({
              universeCanisterId: universeCanisterId,
              neuron,
              proposal,
              toastId,
            });

            const optimisticProposal = proposalAfterVote({
              proposal,
              neurons: successfulVotedNeurons,
              vote: toSnsVote(vote),
            });
            await updateProposalContext(optimisticProposal);
          })
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
