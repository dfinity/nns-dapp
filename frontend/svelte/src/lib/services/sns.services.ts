import type { ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { mockProposalInfo } from "../../tests/mocks/proposal.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapState,
} from "../../tests/mocks/sns-projects.mock";
import { mockAbout5SecondsWaiting } from "../../tests/mocks/utils.mock";
import { AppPath } from "../constants/routes.constants";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/snsProjects.store";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { loadSnsProposals } from "./proposals.services";
import type { SnsSummary, SnsSwapState } from "./sns.mock";

/**
 * Loads summaries with swapStates
 */
export const loadSnsFullProjects = async () => {
  const summaries = await listSnsSummary();

  snsSummariesStore.setSummaries({
    summaries,
    certified: true,
  });

  for (const { rootCanisterId } of summaries) {
    loadSnsSwapState(rootCanisterId).then((swapState) =>
      snsSwapStatesStore.setSwapState({
        swapState,
        certified: true,
      })
    );
  }
};

/**
 * Loads summaries with swapStates
 */
export const loadSnsFullProject = async (canisterId) => {
  const summaries = await listSnsSummary();

  snsSummariesStore.setSummaries({
    summaries,
    certified: true,
  });

  await Promise.all(
    summaries.map(
      async ({ rootCanisterId }) =>
        canisterId === rootCanisterId &&
        loadSnsSwapState(rootCanisterId).then((swapState) =>
          snsSwapStatesStore.setSwapState({
            swapState,
            certified: true,
          })
        )
    )
  );
};

export const loadSnsSwapState = async (
  rootCanisterId: Principal
): Promise<SnsSwapState> =>
  mockAbout5SecondsWaiting(() => mockSnsSwapState(rootCanisterId));

export const listSnsSummary = async (): Promise<SnsSummary[]> =>
  mockAbout5SecondsWaiting(() => mockSnsSummaryList);

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
  if (!isRoutePath({ path: AppPath.NeuronDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
};
