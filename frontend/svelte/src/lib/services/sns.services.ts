import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mockProposalInfo } from "../../tests/mocks/proposal.mock";
import { mockSnsSwapState } from "../../tests/mocks/sns-projects.mock";
import {
  listSnsSummaries,
  listSnsSummary,
  mockAbout5SecondsWaiting,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/projects.store";
import type { SnsSwapState } from "../types/sns";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { getIdentity } from "./auth.services";
import { loadSnsProposals } from "./proposals.services";

/**
 * Loads summaries with swapStates
 */
export const loadSnsFullProjects = async () => {
  const identity = await getIdentity();

  const summaries = await listSnsSummaries({ identity });

  snsSummariesStore.setSummaries({
    summaries,
    certified: true,
  });

  // TODO: remove and replace with effective data
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
export const loadSnsFullProject = async (canisterId: string) => {
  const identity = await getIdentity();

  // TODO: load only if not yet in store

  const [summary, swapState] = await Promise.all([
    listSnsSummary({
      rootCanisterId: Principal.fromText(canisterId),
      identity,
    }),
    loadSnsSwapState(Principal.fromText(canisterId)),
  ]);

  // TODO: detail page should not use these store
  snsSummariesStore.setSummaries({
    summaries: [...(summary ? [summary] : [])],
    certified: true,
  });
  snsSwapStatesStore.setSwapState({
    swapState,
    certified: true,
  });
};

export const loadSnsSwapState = async (
  rootCanisterId: Principal
): Promise<SnsSwapState> =>
  mockAbout5SecondsWaiting(() => mockSnsSwapState(rootCanisterId));

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
