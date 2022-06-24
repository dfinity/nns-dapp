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

export const listSnsSummary = async (): Promise<SnsSummary[]> =>
  mockWaiting(() => SNS_SUMMARY_LIST);
