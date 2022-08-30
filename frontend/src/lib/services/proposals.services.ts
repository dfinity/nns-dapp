import type { Identity } from "@dfinity/agent";
import type { ProposalId, ProposalInfo, Topic } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  queryProposal,
  queryProposalPayload,
  queryProposals,
} from "../api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "../canisters/nns-dapp/nns-dapp.errors";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "../constants/constants";
import { AppPath } from "../constants/routes.constants";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  type ProposalsFiltersStore,
} from "../stores/proposals.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetailId, isRoutePath } from "../utils/app-path.utils";
import { hashCode } from "../utils/dev.utils";
import { errorToString } from "../utils/error.utils";
import {
  excludeProposals,
  proposalsHaveSameIds,
} from "../utils/proposals.utils";
import { getIdentity } from "./auth.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnError,
  type QueryAndUpdateOnResponse,
  type QueryAndUpdateStrategy,
} from "./utils.services";

const handleFindProposalsError = ({ error: err, certified }) => {
  console.error(err);

  // Explicitly handle only UPDATE errors
  if (certified === true) {
    proposalsStore.setProposals({ proposals: [], certified });

    toastsStore.error({
      labelKey: "error.list_proposals",
      err,
    });
  }
};

export const listProposals = async ({
  loadFinished,
}: {
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean;
  }) => void;
}): Promise<void> => {
  return findProposals({
    beforeProposal: undefined,
    onLoad: ({ response: proposals, certified }) => {
      proposalsStore.setProposals({ proposals, certified });
      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
    },
    onError: handleFindProposalsError,
  });
};

/**
 * List the nex proposals in a paginated way.
 * @param {beforeProposal: ProposalId | undefined; loadFinished: (paginationOver: boolean) => void;} params
 * @param {ProposalId | undefined} params.beforeProposal Pagination starting proposal. Undefined for first results
 * @param {(paginationOver: boolean) => void;} params.loadFinished Triggered when the loading is over. `paginationOver` equals `true` if all pages of the list have been queried.
 */
export const listNextProposals = async ({
  beforeProposal,
  loadFinished,
}: {
  beforeProposal: ProposalId | undefined;
  loadFinished: (params: {
    paginationOver: boolean;
    certified: boolean;
  }) => void;
}): Promise<void> =>
  findProposals({
    beforeProposal,
    onLoad: ({ response: proposals, certified }) => {
      if (proposals.length === 0) {
        // There is no more proposals to fetch for the current filters.
        // We do not update the store with empty ([]) because we can spare the re-render of the items.
        loadFinished({ paginationOver: true, certified });
        return;
      }

      proposalsStore.pushProposals({ proposals, certified });
      loadFinished({
        paginationOver: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
        certified,
      });
    },
    onError: handleFindProposalsError,
  });

const findProposals = async ({
  beforeProposal,
  onLoad,
  onError,
}: {
  beforeProposal: ProposalId | undefined;
  onLoad: QueryAndUpdateOnResponse<ProposalInfo[]>;
  onError: QueryAndUpdateOnError<unknown>;
}): Promise<void> => {
  const identity: Identity = await getIdentity();
  const filters: ProposalsFiltersStore = get(proposalsFiltersStore);

  const { topics, rewards, status } = filters;

  // The governance canister consider empty filters and an "any" query. Flutter on the contrary considers empty as empty.
  // That's why we implement the same behavior and do not render any proposals if one of the filter is empty.
  // This is covered by our utils "hideProposal" but to avoid glitch, like displaying a spinner appearing and disappearing for a while, we "just" do not query the canister and empty the store if one of the filter is empty.
  if (topics.length === 0 || rewards.length === 0 || status.length === 0) {
    proposalsStore.setProposals({ proposals: [], certified: undefined });
    return;
  }

  const validateResponses = (
    trustedProposals: ProposalInfo[],
    untrustedProposals: ProposalInfo[]
  ) => {
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
      proposalsStore.removeProposals(proposalsToRemove);
    }
  };
  let uncertifiedProposals: ProposalInfo[] | undefined;

  return queryAndUpdate<ProposalInfo[], unknown>({
    request: ({ certified }) =>
      queryProposals({ beforeProposal, identity, filters, certified }),
    onLoad: ({ response: proposals, certified }) => {
      if (certified === false) {
        uncertifiedProposals = proposals;
        onLoad({ response: proposals, certified });
        return;
      }

      if (uncertifiedProposals) {
        validateResponses(proposals, uncertifiedProposals);
      }

      onLoad({ response: proposals, certified });
    },
    onError,
    logMessage: `Syncing proposals ${
      beforeProposal === undefined ? "" : `from: ${hashCode(beforeProposal)}`
    }`,
  });
};

// TODO L2-751: switch to real data
export const loadProposalsByTopic = async ({
  topic,
  certified,
  identity,
}: {
  topic: Topic;
  certified: boolean;
  identity: Identity;
}): Promise<ProposalInfo[]> => {
  const filters: ProposalsFiltersStore = {
    ...get(proposalsFiltersStore),
    topics: [topic],
    rewards: [],
    status: [],
    excludeVotedProposals: false,
    lastAppliedFilter: undefined,
  };

  return queryProposals({
    beforeProposal: undefined,
    identity,
    filters,
    certified,
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
  silentUpdateErrorMessages,
  strategy = "query_and_update",
}: {
  proposalId: ProposalId;
  setProposal: (proposal: ProposalInfo) => void;
  handleError?: (certified: boolean) => void;
  callback?: (certified: boolean) => void;
  silentErrorMessages?: boolean;
  silentUpdateErrorMessages?: boolean;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const catchError: QueryAndUpdateOnError<Error | unknown> = (
    erroneusResponse
  ) => {
    console.error(erroneusResponse);

    const skipUpdateErrorHandling =
      silentUpdateErrorMessages === true && erroneusResponse.certified === true;

    if (silentErrorMessages !== true && !skipUpdateErrorHandling) {
      const details = errorToString(erroneusResponse?.error);
      toastsStore.show({
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
  onError: QueryAndUpdateOnError<Error | undefined>;
  strategy: QueryAndUpdateStrategy;
}): Promise<void> => {
  const identity: Identity = await getIdentity();

  return queryAndUpdate<ProposalInfo | undefined, unknown>({
    request: ({ certified }) =>
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
  const identity: Identity = await getIdentity();

  try {
    proposalPayloadsStore.setPayload({ proposalId, payload: undefined });
    const payload = await queryProposalPayload({ proposalId, identity });
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
      toastsStore.error({
        labelKey: "error.proposal_payload_not_found",
        substitutions: {
          $proposal_id: proposalId.toString(),
        },
      });

      // set 'null' avoid refetching of not existing data
      proposalPayloadsStore.setPayload({ proposalId, payload: null });

      return;
    }

    toastsStore.error({
      labelKey: "error.proposal_payload",
      err,
    });
  }
};

export const routePathProposalId = (
  path: string
): { proposalId: ProposalId | undefined } | undefined => {
  if (!isRoutePath({ path: AppPath.ProposalDetail, routePath: path })) {
    return undefined;
  }

  const proposalId: ProposalId | undefined = getLastPathDetailId(path);
  return { proposalId };
};
