import type { Principal } from "@dfinity/principal";
import {
  mockWaiting,
  SNS_SUMMARY_LIST,
  SNS_SWAP_STATES_MAP,
  type SnsSummary,
  type SnsSwapState,
} from "./sns.services.mock";

export const loadSnsSwapState = async (
  rootCanisterId: Principal
): Promise<SnsSwapState> =>
  mockWaiting(() => SNS_SWAP_STATES_MAP[rootCanisterId.toText()]);

// 0. separate data that rarely changed from another
// 1. prepare mock + PR
// 2. notion with a field table whre it comes from

// the current light version ok
// 3. drop down mobile
// 4. modal?

export const listSnsSummary = async (): Promise<SnsSummary[]> =>
  mockWaiting(() => SNS_SUMMARY_LIST);
