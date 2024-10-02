import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
} from "$lib/api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  type ProposalsFiltersStore,
  type SingleMutationProposalsStore,
} from "$lib/stores/proposals.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import { hashCode } from "$lib/utils/dev.utils";
import { isLastCall } from "$lib/utils/env.utils";
import { errorToString, isPayloadSizeError } from "$lib/utils/error.utils";
import {
  excludeProposals,
  proposalsHaveSameIds,
} from "$lib/utils/proposals.utils";
import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { getCurrentIdentity } from "../auth.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnError,
  type QueryAndUpdateOnResponse,
  type QueryAndUpdateStrategy,
} from "../utils.services";

const handleFindProposalsError = ({
  error: err,
  certified,
  strategy,
  mutableProposalsStore,
}: {
  error: unknown;
  certified: boolean;
  strategy: QueryAndUpdateStrategy;
  mutableProposalsStore: SingleMutationProposalsStore;
}) => {
  console.error(err);
  if (
    isLastCall({ strategy, certified })
  ) {
    mutableProposalsStore.setProposals({ proposals: [], certified });

    const resultsTooLarge = isPayloadSizeError(err);

    toastsError({
      labelKey: resultsTooLarge
        ? "error.list_proposals_payload_too_large"
        : "error.list_proposals",
      err: resultsTooLarge ? undefined : err,
    });
  }
};

export const listProposals = async ({
  loadFinished,
}: {
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean | undefined;
  }) => void;
}): Promise<void> => {
  const mutableProposalsStore =
    proposalsStore.getSingleMutationProposalsStore();
  return findProposals({
    beforeProposal: undefined,
    onLoad: ({ response: proposals, certified }) => {
      mutableProposalsStore.setProposals({ proposals, certified });

      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
    },
    onError: (onErrorParams: {
      error: unknown;
      certified: boolean;
      strategy: QueryAndUpdateStrategy;
    }) => {
      handleFindProposalsError({
        ...onErrorParams,
        mutableProposalsStore,
      });
    },
    mutableProposalsStore,
  });
};

/**
 * List the nex proposals in a paginated way.
 * @param {beforeProposal: ProposalId | undefined; loadFinished: (paginationOver: boolean) => void;} params
 * @param {ProposalId | undefined} params.beforeProposal Pagination starting proposal. Undefined for first results
 * @param {(paginationOver: boolean) => void} params.loadFinished Triggered when the loading is over. `paginationOver` equals `true` if all pages of the list have been queried.
 */
export const listNextProposals = async ({
  beforeProposal,
  loadFinished,
}: {
  beforeProposal: ProposalId | undefined;
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean | undefined;
  }) => void;
}): Promise<void> => {
  const mutableProposalsStore =
    proposalsStore.getSingleMutationProposalsStore();
  return findProposals({
    beforeProposal,
    onLoad: ({ response: proposals, certified }) => {
      if (proposals.length === 0) {
        // There is no more proposals to fetch for the current filters.
        // We do not update the store with empty ([]) because we can spare the re-render of the items.
        loadFinished({ paginationOver: true, certified });
        return;
      }

      mutableProposalsStore.pushProposals({ proposals, certified });
      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
    },
    onError: (onErrorParams: {
      error: unknown;
      certified: boolean;
      strategy: QueryAndUpdateStrategy;
    }) => {
      handleFindProposalsError({
        ...onErrorParams,
        mutableProposalsStore,
      });
    },
    mutableProposalsStore,
  });
};

const findProposals = async ({
  beforeProposal,
  onLoad,
  onError,
  mutableProposalsStore,
}: {
  beforeProposal: ProposalId | undefined;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo[]>;
  onError: QueryAndUpdateOnError<unknown>;
  mutableProposalsStore: SingleMutationProposalsStore;
}): Promise<void> => {
  const filters: ProposalsFiltersStore = get(proposalsFiltersStore);

  const validateResponses = ({
    trustedProposals,
    untrustedProposals,
  }:{
    trustedProposals: ProposalInfo[];
    untrustedProposals: ProposalInfo[];
  }) => {
    if (
      proposalsHaveSameIds({
        proposalsA: untrustedProposals,
        proposalsB: trustedProposals,
      })
    ) {
      return;
    }

    console.error("query != update", untrustedProposals, trustedProposals);

    // Remove proven untrusted proposals (in query but not in update)
    const proposalsToRemove = excludeProposals({
      proposals: untrustedProposals,
      exclusion: trustedProposals,
    });
    if (proposalsToRemove.length > 0) {
      mutableProposalsStore.removeProposals({
        proposalsToRemove,
        certified: true,
      });
    }
  };
  let uncertifiedProposals: ProposalInfo[] | undefined;

  return queryAndUpdate<ProposalInfo[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        beforeProposal,
        identity,
        includeTopics: filters.topics,
        includeStatus: filters.status,
        certified,
      }),
    onLoad: ({ response: proposals, certified, strategy }) => {
      if (!certified) {
        uncertifiedProposals = proposals;
        onLoad({ response: proposals, certified, strategy });
        return;
      }

      if (uncertifiedProposals) {
        validateResponses({
          trustedProposals: proposals,
          untrustedProposals: uncertifiedProposals,
        });
      }

      onLoad({ response: proposals, certified, strategy });
    },
    onError,
    logMessage: `Syncing proposals ${
      beforeProposal === undefined ? "" : `from: ${hashCode(beforeProposal)}`
    }`,
  });
};

/**
 * Get from store or query a proposal and apply the result to the callback (`setProposal`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadProposal = async ({
  proposalId,
  setProposal,
  handleError,
  callback,
  silentErrorMessages,
  strategy,
}: {
  proposalId: ProposalId;
  setProposal: (proposal: ProposalInfo) => void;
  handleError?: (certified: boolean) => void;
  callback?: (certified: boolean) => void;
  silentErrorMessages?: boolean;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const identity = getCurrentIdentity();

  const catchError: QueryAndUpdateOnError<Error | unknown> = (
    erroneusResponse
  ) => {
    console.error(erroneusResponse);

    if (silentErrorMessages !== true && (
      erroneusResponse.certified || (
        strategy === "query" ||
        identity.getPrincipal().isAnonymous()
      )
    )) {
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
      proposalId,
      onLoad: ({ response: proposal, certified, strategy }) => {
        if (!proposal) {
          catchError({ certified, strategy, error: undefined, identity });
          return;
        }

        setProposal(proposal);

        callback?.(certified);
      },
      onError: catchError,
      strategy,
    });
  } catch (error: unknown) {
    catchError({
      certified: true,
      strategy: strategy ?? "query_and_update",
      error,
      identity,
    });
  }
};

/**
 * Return single proposal from proposalsStore or fetch it (in case of page reload or direct navigation to proposal-detail page)
 */
const getProposal = async ({
  proposalId,
  onLoad,
  onError,
  strategy,
}: {
  proposalId: ProposalId;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo | undefined>;
  onError: QueryAndUpdateOnError<Error | unknown | undefined>;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  return queryAndUpdate<ProposalInfo | undefined, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposal({ proposalId, identity, certified }),
    onLoad,
    onError,
    strategy,
    logMessage: `Syncing Proposal ${hashCode(proposalId)}`,
  });
};

/**
 * Loads proposal payload in proposalPayloadsStore.
 * Updates the proposalPayloadsStore with:
 * - `undefined` - loading
 * - `null` - erroneous
 * - otherwise data `object`
 */
export const loadProposalPayload = async ({
  proposalId,
}: {
  proposalId: ProposalId;
}): Promise<void> => {
  try {
    proposalPayloadsStore.setPayload({ proposalId, payload: undefined });
    const payload = await queryProposalPayload({
      proposalId,
      identity: getCurrentIdentity(),
    });
    proposalPayloadsStore.setPayload({ proposalId, payload });
  } catch (err) {
    console.error(err);

    if (err instanceof ProposalPayloadTooLargeError) {
      proposalPayloadsStore.setPayload({
        proposalId,
        payload: { error: "Payload too large" },
      });

      return;
    }
    if (err instanceof ProposalPayloadNotFoundError) {
      toastsError({
        labelKey: "error.proposal_payload_not_found",
        substitutions: {
          $proposal_id: proposalId.toString(),
        },
      });

      // set 'null' avoid refetching of not existing data
      proposalPayloadsStore.setPayload({ proposalId, payload: null });

      return;
    }

    toastsError({
      labelKey: "error.proposal_payload",
      err,
    });
  }
};
