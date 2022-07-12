import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mockProposalInfo } from "../../tests/mocks/proposal.mock";
import {
  mockAbout5SecondsWaiting,
  querySnsSummaries,
  querySnsSummary,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/projects.store";
import { toastsStore } from "../stores/toasts.store";
import type { SnsSummary, SnsSwapState } from "../types/sns";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { loadSnsProposals } from "./proposals.services";
import { queryAndUpdate } from "./utils.services";

// TODO(L2-751): remove and replace with effective data
let mockSwapStates: SnsSwapState[] = [];
const mockDummySwapStates: Partial<SnsSwapState>[] = [
  {
    myCommitment: BigInt(25 * 100000000),
    currentCommitment: BigInt(100 * 100000000),
  },
  {
    myCommitment: BigInt(5 * 100000000),
    currentCommitment: BigInt(775 * 100000000),
  },
  {
    myCommitment: undefined,
    currentCommitment: BigInt(1000 * 100000000),
  },
  {
    myCommitment: undefined,
    currentCommitment: BigInt(1500 * 100000000),
  },
];

export const loadSnsSummaries = (): Promise<void> =>
  queryAndUpdate<SnsSummary[], unknown>({
    request: ({ certified, identity }) =>
      querySnsSummaries({ certified, identity }),
    onLoad: ({ response: summaries, certified }) => {
      snsSummariesStore.setSummaries({
        summaries,
        certified,
      });

      // TODO(L2-751): remove mock data
      if (mockSwapStates.length > 0) {
        return;
      }

      // TODO(L2-751): remove mock data
      mockSwapStates = summaries.map(
        ({ rootCanisterId }) =>
          ({
            ...mockDummySwapStates[
              Math.floor(0 + Math.random() * (mockDummySwapStates.length - 1))
            ],
            rootCanisterId,
          } as SnsSwapState)
      );
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
          fallbackErrorLabelKey: "error__sns.list_summaries",
        })
      );
    },
    logMessage: "Syncing Sns summaries",
  });

export const loadSnsSummary = async (canisterId: string) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<SnsSummary | undefined, unknown>({
    request: ({ certified, identity }) =>
      querySnsSummary({
        rootCanisterId: canisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: summary, certified }) =>
      // TODO(L2-840): detail page should not use that summaries store but only a dedicated state or context store
      snsSummariesStore.setSummaries({
        summaries: [...(summary ? [summary] : [])],
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
          fallbackErrorLabelKey: "error__sns.load_summary",
        })
      );
    },
    logMessage: "Syncing Sns summary",
  });
};

export const loadSnsSwapStates = async (
  summaries: SnsSummary[] | undefined
) => {
  if (summaries === undefined) {
    snsSwapStatesStore.reset();
    return;
  }

  // TODO(L2-751): remove and replace with effective data
  // TODO: query and update calls
  for (const { rootCanisterId } of summaries) {
    loadSnsSwapState(rootCanisterId).then((swapState) =>
      snsSwapStatesStore.setSwapState({
        swapState,
        certified: true,
      })
    );
  }
};

// TODO(L2-751): remove and replace with effective data
// TODO: query and update calls
const loadSnsSwapState = async (
  rootCanisterId: Principal
): Promise<SnsSwapState> =>
  mockAbout5SecondsWaiting(
    () =>
      mockSwapStates.find(
        (mock) => rootCanisterId.toText() === mock.rootCanisterId.toText()
      ) as SnsSwapState
  );

export const loadSnsSwapStateStore = async (
  rootCanisterId: string | undefined
): Promise<void> => {
  // TODO: we probably do not want to use this store in the detail page and do not want to reset everything
  if (rootCanisterId === undefined) {
    snsSwapStatesStore.reset();
    return;
  }

  const swapState = await loadSnsSwapState(Principal.fromText(rootCanisterId));

  snsSwapStatesStore.setSwapState({
    swapState,
    certified: true,
  });
};

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
