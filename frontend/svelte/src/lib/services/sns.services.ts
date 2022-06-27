import type { Principal } from "@dfinity/principal";
import {
  mockSnsSummaryList,
  mockSnsSwapState,
} from "../../tests/mocks/sns-projects.mock";
import { mockAbout5SecondsWaiting } from "../../tests/mocks/utils.mock";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/snsProjects.store";
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

export const loadSnsSwapState = async (
  rootCanisterId: Principal
): Promise<SnsSwapState> =>
  mockAbout5SecondsWaiting(() => mockSnsSwapState(rootCanisterId));

export const listSnsSummary = async (): Promise<SnsSummary[]> =>
  mockAbout5SecondsWaiting(() => mockSnsSummaryList);
