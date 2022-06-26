import type { Principal } from "@dfinity/principal";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../stores/snsProjects.store";
import {
  mockWaiting,
  SNS_SUMMARY_LIST,
  SNS_SWAP_STATES_MAP,
  type SnsSummary,
  type SnsSwapState,
} from "./sns.services.mock";

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
  mockWaiting(() => SNS_SWAP_STATES_MAP[rootCanisterId.toText()]);

export const listSnsSummary = async (): Promise<SnsSummary[]> =>
  mockWaiting(() => SNS_SUMMARY_LIST);
