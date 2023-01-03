import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  committedProjectsStore,
  type SnsFullProject,
} from "$lib/stores/projects.store";
import type { SnsSummary } from "$lib/types/sns";
import { derived, type Readable } from "svelte/store";

export interface SelectableProject {
  canisterId: string;
  summary?: SnsSummary;
}

const NNS_PROJECT: SelectableProject = {
  canisterId: OWN_CANISTER_ID.toText(),
};

export const selectableProjects = derived<
  Readable<SnsFullProject[] | undefined>,
  SelectableProject[]
>(committedProjectsStore, (projects: SnsFullProject[] | undefined) => [
  NNS_PROJECT,
  ...(projects?.map(({ rootCanisterId, summary }) => ({
    canisterId: rootCanisterId.toText(),
    summary,
  })) ?? []),
]);
