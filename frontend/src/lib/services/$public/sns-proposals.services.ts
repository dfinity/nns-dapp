import { queryProposal, queryProposals } from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData, SnsProposalId } from "@dfinity/sns";
import {
  queryAndUpdate,
  type QueryAndUpdateOnError,
  type QueryAndUpdateOnResponse,
  type QueryAndUpdateStrategy,
} from "../utils.services";

export const loadSnsProposals = async ({
  rootCanisterId,
  beforeProposalId,
}: {
  rootCanisterId: Principal;
  beforeProposalId?: SnsProposalId;
}) => {
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

/**
 * Query a proposal and apply the result to the callback (`setProposal`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadSnsProposal = async ({
  rootCanisterId,
  proposalId,
  setProposal,
  handleError,
  strategy = "query_and_update",
}: {
  rootCanisterId: Principal;
  proposalId: bigint;
  setProposal: (proposal: SnsProposalData) => void;
  handleError: (props: { certified: boolean; error: unknown }) => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  try {
    return await getProposal({
      rootCanisterId,
      proposalId,
      onLoad: ({ response: proposal, certified }) => {
        if (!proposal) {
          handleError({ certified, error: undefined });
          return;
        }

        setProposal(proposal);
      },
      onError: handleError,
      strategy,
    });
  } catch (error: unknown) {
    handleError({ certified: true, error });
  }
};

const getProposal = async ({
  rootCanisterId,
  proposalId,
  onLoad,
  onError,
  strategy = "query_and_update",
}: {
  rootCanisterId: Principal;
  proposalId: bigint;
  onLoad: QueryAndUpdateOnResponse<SnsProposalData | undefined>;
  onError: QueryAndUpdateOnError<Error | unknown | undefined>;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  return queryAndUpdate<SnsProposalData, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposal({
        identity,
        certified,
        rootCanisterId,
        proposalId,
      }),
    onLoad,
    onError,
    strategy,
  });
};
