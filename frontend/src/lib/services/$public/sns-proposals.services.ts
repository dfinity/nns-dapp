import {queryProposals, registerVote as registerVoteApi,} from "$lib/api/sns-governance.api";
import {DEFAULT_SNS_PROPOSALS_PAGE_SIZE} from "$lib/constants/sns-proposals.constants";
import {snsOnlyProjectStore} from "$lib/derived/sns/sns-selected-project.derived";
import {sortedSnsUserNeuronsStore} from "$lib/derived/sorted-sns-neurons.derived";
import {getSnsNeuronIdentity, syncSnsNeurons,} from "$lib/services/sns-neurons.services";
import {authStore} from "$lib/stores/auth.store";
import {snsProposalsStore} from "$lib/stores/sns-proposals.store";
import {toastsError, toastsSuccess} from "$lib/stores/toasts.store";
import {getSnsNeuronState, hasPermissionToVote, subaccountToHexString} from "$lib/utils/sns-neuron.utils";
import {isNullish} from "$lib/utils/utils";
import type {Vote} from "@dfinity/nns";
import {NeuronState} from "@dfinity/nns";
import type {Principal} from "@dfinity/principal";
import type {SnsNeuron, SnsNeuronId, SnsProposalData, SnsProposalId,} from "@dfinity/sns";
import {fromDefinedNullable} from "@dfinity/utils";
import {get} from "svelte/store";
import {queryAndUpdate} from "../utils.services";

export const registerVote = async ({
  rootCanisterId,
  neuronId,
  proposalId,
  vote,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  proposalId: SnsProposalId;
  vote: Vote;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getSnsNeuronIdentity();

    await registerVoteApi({
      rootCanisterId,
      identity,
      neuronId,
      proposalId,
      vote,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_register_vote",
      substitutions: {
        $neuronId: subaccountToHexString(neuronId.id),
      },
      err,
    });
    return { success: false };
  }
};

export const registerVoteDemo = async ({
  vote,
  proposal,
}: {
  vote: Vote;
  proposal: SnsProposalData;
}) => {
  let registrations = 0;

  const rootCanisterId = get(snsOnlyProjectStore);

  if (isNullish(rootCanisterId)) {
    throw new Error("no rootCanisterId");
  }

  const registerNeuronVote = async (neuron: SnsNeuron) => {
    await registerVote({
      rootCanisterId,
      neuronId: fromDefinedNullable(neuron.id),
      proposalId: fromDefinedNullable(proposal.id),
      vote,
    });
    registrations++;
  };

  try {
    await syncSnsNeurons(rootCanisterId);

    const neurons = get(sortedSnsUserNeuronsStore);
    const votableNeurons = neurons.filter((neuron) =>
      getSnsNeuronState(neuron) !== NeuronState.Dissolved &&
      hasPermissionToVote({ neuron, identity: get(authStore).identity })
    );

    if (votableNeurons.length === 0) {
      toastsError({
        labelKey: `None of ${neurons.length} neurons is allowed to vote`,
      });
      return;
    }

    await Promise.all(votableNeurons.map(registerNeuronVote));

    await loadSnsProposals({
      rootCanisterId,
    });

    const $snsProposalsStore = get(snsProposalsStore);

    console.log(
      "Proposal after voting:",
      (
        $snsProposalsStore[rootCanisterId.toText()]
          ?.proposals as SnsProposalData[]
      )?.find(
        ({ id }) =>
          fromDefinedNullable(id).id === fromDefinedNullable(proposal.id).id
      )
    );

    toastsSuccess({
      labelKey: `${registrations} votes were successfully registered`,
    });
  } catch (err) {
    toastsError({
      labelKey: `There was an error while vote registration. ${registrations} votes registered.`,
      err,
    });
  }
};

export const loadSnsProposals = async ({
  rootCanisterId,
  beforeProposalId,
}: {
  rootCanisterId: Principal;
  beforeProposalId?: SnsProposalId;
}): Promise<void> => {
  return queryAndUpdate<SnsProposalData[], unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        params: {
          limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
          beforeProposal: beforeProposalId,
        },
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response: proposals, certified }) => {
      snsProposalsStore.addProposals({
        rootCanisterId,
        proposals,
        certified,
        completed: proposals.length < DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
      });
    },
    onError: (err) => {
      toastsError({
        labelKey: "error.list_proposals",
        err,
      });
    },
  });
};
