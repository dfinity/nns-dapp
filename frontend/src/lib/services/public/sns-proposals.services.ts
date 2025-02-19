import {
  queryProposal,
  queryProposals,
  registerVote as registerVoteApi,
} from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
import { sortedSnsUserNeuronsStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
import {
  getSnsNeuronIdentity,
  syncSnsNeurons,
} from "$lib/services/sns-neurons.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { authStore } from "$lib/stores/auth.store";
import { snsSelectedFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import {
  getSnsNeuronState,
  hasPermissionToVote,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { toExcludeTypeParameter } from "$lib/utils/sns-proposals.utils";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsListProposalsResponse,
  SnsNervousSystemFunction,
  SnsNeuron,
  SnsNeuronId,
  SnsProposalData,
  SnsProposalId,
  SnsVote,
} from "@dfinity/sns";
import { fromDefinedNullable, isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const registerVote = async ({
  rootCanisterId,
  neuronId,
  proposalId,
  vote,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  proposalId: SnsProposalId;
  vote: SnsVote;
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

// TODO(demo): remove after voting implementation
export const registerVoteDemo = async ({
  vote,
  proposal,
  snsFunctions,
}: {
  vote: SnsVote;
  proposal: SnsProposalData;
  snsFunctions: SnsNervousSystemFunction[];
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
    const votableNeurons = neurons.filter(
      (neuron) =>
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
      snsFunctions,
    });

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
  snsFunctions,
  beforeProposalId,
}: {
  rootCanisterId: Principal;
  snsFunctions: SnsNervousSystemFunction[];
  beforeProposalId?: SnsProposalId;
}): Promise<void> => {
  const filters = get(snsSelectedFiltersStore)[rootCanisterId.toText()];
  const excludeType = toExcludeTypeParameter({
    filter: filters?.types ?? [],
    snsFunctions,
  });
  return queryAndUpdate<SnsListProposalsResponse, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        params: {
          limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
          beforeProposal: beforeProposalId,
          includeStatus:
            filters?.decisionStatus.map(({ value }) => value) ?? [],
          excludeType,
        },
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response, certified }) => {
      const { proposals } = response;
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
    logMessage: "loadSnsProposals",
  });
};

/**
 * Calls the callback `setProposal` with the proposal found by the `proposalId` or `undefined` if not found.
 * - queryAndUpdate is used, and it calls the callback with the result twice.
 *
 * @param {Object} params
 * @param {Principal} params.rootCanisterId
 * @param {SnsProposalId} params.proposalId
 * @param {Function} params.handleError
 */
export const getSnsProposalById = async ({
  rootCanisterId,
  proposalId,
  setProposal,
  handleError,
}: {
  rootCanisterId: Principal;
  proposalId: SnsProposalId;
  setProposal: (params: {
    proposal: SnsProposalData;
    certified: boolean;
  }) => void;
  handleError?: (err: unknown) => void;
}): Promise<void> => {
  return queryAndUpdate<SnsProposalData, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposal({
        proposalId,
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response: proposal, certified }) => {
      setProposal({ proposal, certified });
    },
    onError: (err) => {
      toastsError({
        labelKey: "error.get_proposal",
        substitutions: {
          $proposalId: proposalId.id.toString(),
        },
        err,
      });
      handleError?.(err);
    },
    logMessage: "getSnsProposalById",
  });
};
