import type { ProposalInfo } from "@dfinity/nns";
import { mockProposalInfo } from "../../tests/mocks/proposal.mock";
import {
  querySnsSummaries,
  querySnsSummary,
  querySnsSwapState,
  querySnsSwapStates,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../stores/projects.store";
import { toastsStore } from "../stores/toasts.store";
import type { SnsSummary, SnsSwapCommitment } from "../types/sns";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { loadSnsProposals } from "./proposals.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnResponse,
} from "./utils.services";

export const loadSnsSummaries = ({
  onError,
}: {
  onError: () => void;
}): Promise<void> => {
  snsSummariesStore.setLoadingState();

  return queryAndUpdate<SnsSummary[], unknown>({
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

      onError();
    },
    logMessage: "Syncing Sns summaries",
  });
};

export const loadSnsSummary = async ({
  rootCanisterId,
  onLoad,
  onError,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSummary>;
  onError: () => void;
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

      onError();
    },
    logMessage: "Syncing Sns summary",
  });
};

export const loadSnsSwapStates = ({
  onError,
}: {
  onError: () => void;
}): Promise<void> => {
  snsSwapCommitmentsStore.setLoadingState();

  return queryAndUpdate<SnsSwapCommitment[], unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapStates({ certified, identity }),
    onLoad: ({ response: swapCommitments, certified }) => {
      for (const swapCommitment of swapCommitments) {
        snsSwapCommitmentsStore.setSwapCommitment({
          swapCommitment,
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

      onError();
    },
    logMessage: "Syncing Sns swap state",
  });
};

export const loadSnsSwapState = async ({
  rootCanisterId,
  onLoad,
  onError,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSwapCommitment>;
  onError: () => void;
}) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<SnsSwapCommitment, unknown>({
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

      onError();
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

export const listSnsProposals = async (): Promise<ProposalInfo[]> =>
  mockAbout5SecondsWaiting(async () => {
    // we need real testnet/mainnet ids to reach proposal details page
    const realProposalIds = (await loadSnsProposals())?.map(({ id }) => id);

    return [
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
  });

export const routePathRootCanisterId = (path: string): string | undefined => {
  if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
};
