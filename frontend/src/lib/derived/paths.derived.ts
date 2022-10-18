import { AppRoutes } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/stores/page.store";
import { paths } from "$lib/utils/app-path.utils";
import { derived } from "svelte/store";
import { snsProjectSelectedStore } from "./selected-project.derived";

// TODO(GIX-1071): constant for u and adapt related text too

export const accountsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppRoutes.Accounts}/?u=${universe}`
);

export const neuronsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppRoutes.Neurons}/?u=${universe}`
);

export const proposalsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppRoutes.Proposals}/?u=${universe}`
);

export const canistersPathStore = derived(
  pageStore,
  ({ universe }) => `${AppRoutes.Canisters}/?u=${universe}`
);

export const neuronPathStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore) =>
    paths.neuronDetail($snsProjectSelectedStore.toText())
);
