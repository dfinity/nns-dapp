import type { SnsSwapCommitment } from "$lib/types/sns";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import type { TokenAmountV2 } from "@dfinity/utils";
import type { Writable } from "svelte/store";

/**
 * SnsSummary or SnsSwapCommitment is a valid project
 *
 * `null` means not initialized
 * `undefined` means not found
 */
export type ProjectDetailStore = {
  summary: SnsSummaryWrapper | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
  totalTokensSupply?: TokenAmountV2 | undefined | null;
};

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
  reload: () => Promise<void>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
