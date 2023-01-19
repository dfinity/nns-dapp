import { queryProposal, queryProposals } from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import { errorToString } from "$lib/utils/error.utils";
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
 * Get from store or query a proposal and apply the result to the callback (`setProposal`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadProposal = async ({
  rootCanisterId,
  proposalId,
  setProposal,
  handleError,
  callback,
  silentErrorMessages,
  silentUpdateErrorMessages,
  strategy = "query_and_update",
}: {
  rootCanisterId: Principal;
  proposalId: bigint;
  setProposal: (proposal: SnsProposalData) => void;
  handleError?: (certified: boolean) => void;
  callback?: (certified: boolean) => void;
  silentErrorMessages?: boolean;
  silentUpdateErrorMessages?: boolean;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  // TODO: where store?
  const catchError: QueryAndUpdateOnError<Error | unknown> = (
    erroneusResponse
  ) => {
    console.error(erroneusResponse);

    const skipUpdateErrorHandling =
      silentUpdateErrorMessages === true && erroneusResponse.certified === true;

    if (silentErrorMessages !== true && !skipUpdateErrorHandling) {
      const details = errorToString(erroneusResponse?.error);
      toastsShow({
        labelKey: "error.proposal_not_found",
        level: "error",
        detail: `id: "${proposalId}"${
          details === undefined ? "" : `. ${details}`
        }`,
      });
    }

    handleError?.(erroneusResponse.certified);
  };

  try {
    return await getProposal({
      rootCanisterId,
      proposalId,
      onLoad: ({ response: proposal, certified }) => {
        if (!proposal) {
          catchError({ certified, error: undefined });
          return;
        }

        setProposal(proposal);

        callback?.(certified);
      },
      onError: catchError,
      strategy,
    });
  } catch (error: unknown) {
    catchError({ certified: true, error });
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
