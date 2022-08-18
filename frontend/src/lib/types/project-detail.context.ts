import type { Writable } from "svelte/store";
import type { SnsFullProject } from "../stores/projects.store";

export type ProjectDetailStore = Partial<SnsFullProject>;

export interface ProjectDetailContext {
  store: Writable<ProjectDetailStore>;
  reload: () => Promise<void>;
}

export const PROJECT_DETAIL_CONTEXT_KEY = Symbol("project-detail");
