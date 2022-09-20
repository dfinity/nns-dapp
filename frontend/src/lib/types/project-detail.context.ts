import type { Writable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "./sns";

/**
 * `null` means not initialized
 * `undefined` means not found
 * SnsSummary or SnsSwapCommitment is a valid project
 */
export type ProjectDetailStore = {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
};

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
  reload: () => Promise<void>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
