import type { Identity } from "@dfinity/agent";
import { Topic, type ProposalInfo } from "@dfinity/nns";
import { mockProposalInfo } from "../../tests/mocks/proposal.mock";
import {
  querySnsSummaries,
  querySnsSummary,
  querySnsSwapState,
  querySnsSwapStates,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsProposalsStore,
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/projects.store";
import { toastsStore } from "../stores/toasts.store";
import type { SnsSummary, SnsSwapState } from "../types/sns";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { getIdentity } from "./auth.services";
import { loadProposalsByTopic } from "./proposals.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnResponse,
} from "./utils.services";

export const loadSnsSummaries = (): Promise<void> =>
  queryAndUpdate<SnsSummary[], unknown>({
    request: ({ certified, identity }) =>
      querySnsSummaries({ certified, identity }),
    onLoad: ({ response: summaries, certified }) =>
      snsSummariesStore.setSummaries({
        summaries,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_summaries",
        })
      );
    },
    logMessage: "Syncing Sns summaries",
  });

export const loadSnsSummary = async ({
  rootCanisterId,
  onLoad,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSummary>;
}) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<SnsSummary | undefined, unknown>({
    request: ({ certified, identity }) =>
      querySnsSummary({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad,
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_summary",
        })
      );
    },
    logMessage: "Syncing Sns summary",
  });
};

export const loadSnsSwapStates = (): Promise<void> =>
  queryAndUpdate<SnsSwapState[], unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapStates({ certified, identity }),
    onLoad: ({ response: swapStates, certified }) => {
      for (const swapState of swapStates) {
        snsSwapStatesStore.setSwapState({
          swapState,
          certified,
        });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_swap_states",
        })
      );
    },
    logMessage: "Syncing Sns swap state",
  });

export const loadSnsSwapState = async ({
  rootCanisterId,
  onLoad,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSwapState>;
}) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<SnsSwapState, unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapState({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad,
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_swap_state",
        })
      );
    },
    logMessage: "Syncing Sns swap state",
  });
};

// TODO(L2-829): to be deleted
const mockAbout5SecondsWaiting = <T>(generator: () => T): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve(generator()),
      Math.round((0.5 + Math.random() * 4.5) * 1000)
    )
  );

export const listSnsProposals = async (): Promise<void> => {
  snsProposalsStore.setLoadingState();

  return queryAndUpdate<ProposalInfo[], unknown>({
    request: ({ certified, identity }) =>
      loadProposalsByTopic({
        certified,
        identity,
        topic: Topic.SnsDecentralizationSale,
      }),
    onLoad: async ({ response: proposals, certified }) => {
      console.log("listSnsProposals", proposals);

      // TODO L2-751: switch to real data
      // For the demo purpose:
      // if there is no proposals provided by the backend
      // we switch to the mock proposals
      if (proposals.length > 0) {
        snsProposalsStore.setProposals({
          proposals,
          certified,
        });
      } else {
        const identity: Identity = await getIdentity();
        // we need real testnet/mainnet ids to reach proposal details page
        const realProposals = await loadProposalsByTopic({
          topic: Topic.Governance,
          certified: false,
          identity,
        });
        const realProposalIds = realProposals?.map(({ id }) => id);
        const mockProposals = [
          {
            ...mockProposalInfo,
            id: realProposalIds?.[0] ?? BigInt(0),
            proposal: {
              ...mockProposalInfo.proposal,
              title: "Project Lode Jogger",
            },
            latestTally: {
              no: BigInt(400000000),
              yes: BigInt(1600000000),
            },
          },
          {
            ...mockProposalInfo,
            id: realProposalIds?.[1] ?? BigInt(1),
            proposal: {
              ...mockProposalInfo.proposal,
              title: "Project ExciteBicycle",
            },
            latestTally: {
              no: BigInt(100000000),
              yes: BigInt(2000000000),
            },
          },
          {
            ...mockProposalInfo,
            id: realProposalIds?.[2] ?? BigInt(2),
            proposal: {
              ...mockProposalInfo.proposal,
              title: "Project The Amazing Bug-Man",
            },
            latestTally: {
              no: BigInt(900000000),
              yes: BigInt(10000000),
            },
          },
          {
            ...mockProposalInfo,
            id: realProposalIds?.[3] ?? BigInt(3),
            proposal: {
              ...mockProposalInfo.proposal,
              title: "Project Street Conflicter",
            },
            latestTally: {
              no: BigInt(500000000),
              yes: BigInt(500000000),
            },
          },
        ] as ProposalInfo[];

        snsProposalsStore.setProposals({
          proposals: mockProposals,
          certified: true,
        });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.proposal_not_found",
        })
      );
    },
    logMessage: "Syncing Sns proposals",
  });
};

export const routePathRootCanisterId = (path: string): string | undefined => {
  if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
};
