import { registerVote as registerSnsVoteApi } from "$lib/api/sns-governance.api";
import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
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
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import {
  getSnsNeuronIdAsHexString,
  snsNeuronVotingPower,
} from "$lib/utils/sns-neuron.utils";
import {
  mapProposalInfo as mapSnsProposal,
  toSnsVote,
} from "$lib/utils/sns-proposals.utils";
import type {
  SnsNervousSystemFunction,
  SnsNervousSystemParameters,
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
  snsParameters,
}: {
  universeCanisterId: UniverseCanisterId;
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  vote: SnsVote;
  updateProposalCallback: (proposal: SnsProposalData) => void;
  snsParameters: SnsNervousSystemParameters;
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
        snsParameters,
      });
    },
    postRegistration: async () => {
      const optimisticProposal = proposalAfterVote({
        proposal,
        neurons,
        vote,
        snsParameters,
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
  snsParameters,
}: {
  proposal: SnsProposalData;
  neurons: SnsNeuron[];
  vote: SnsVote;
  snsParameters: SnsNervousSystemParameters;
}): SnsProposalData => {
  // replace ballots of just voted neurons with optimistic ones
  const optimisticBallots: Array<[string, Ballot]> = neurons.map((neuron) => [
    // neuron id
    getSnsNeuronIdAsHexString(neuron),
    // optimistic ballot
    {
      vote,
      cast_timestamp_seconds: BigInt(Math.round(Date.now() / 1000)),
      voting_power: BigInt(
        Math.round(
          snsNeuronVotingPower({
            neuron,
            snsParameters,
          })
        )
      ),
    } as Ballot,
  ]);
  const votedNeuronsIds = new Set(neurons.map(getSnsNeuronIdAsHexString));

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
  snsParameters,
}: {
  universeCanisterId: UniverseCanisterId;
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  vote: SnsVote;
  updateProposalContext: (proposal: SnsProposalData) => void;
  toastId: symbol;
  snsParameters: SnsNervousSystemParameters;
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
              snsParameters,
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

    // shortened neuron ids for toast message
    const neuronIdStrings = neurons
      .map(getSnsNeuronIdAsHexString)
      .map((id) => shortenWithMiddleEllipsis(id, SNS_NEURON_ID_DISPLAY_LENGTH));

    processRegisterVoteErrors({
      registerVoteResponses,
      neuronIdStrings,
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
