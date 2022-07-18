import type { Writable } from "svelte/store";
import type { SnsSummary, SnsSwapState } from "./sns";

export interface ProjectDetailStore {
  summary: SnsSummary | undefined | null;
  swapState: SnsSwapState | undefined | null;
}

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
