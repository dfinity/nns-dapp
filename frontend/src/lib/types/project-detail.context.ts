import type { Writable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "./sns";

export interface ProjectDetailStore {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
}

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
  reload: () => Promise<void>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
