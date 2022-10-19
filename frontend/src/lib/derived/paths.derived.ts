import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { derived } from "svelte/store";

// TODO(GIX-1071): constant for u and adapt related text too

export const accountsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppPath.Accounts}/?u=${universe}`
);

export const neuronsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppPath.Neurons}/?u=${universe}`
);

export const proposalsPathStore = derived(
  pageStore,
  ({ universe }) => `${AppPath.Proposals}/?u=${universe}`
);

export const canistersPathStore = derived(
  pageStore,
  ({ universe }) => `${AppPath.Canisters}/?u=${universe}`
);
