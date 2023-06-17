import type { TokenAmount } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "./sns";

/**
 * SnsSummary or SnsSwapCommitment is a valid project
 *
 * `null` means not initialized
 * `undefined` means not found
 */
export type ProjectDetailStore = {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
  totalTokensSupply?: TokenAmount | undefined | null;
};

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
  reload: () => Promise<void>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
