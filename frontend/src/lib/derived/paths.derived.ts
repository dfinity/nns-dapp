import { AppPath } from "$lib/constants/routes.constants";
import { pageStore, type Page } from "$lib/derived/page.derived";
import { derived, type Readable } from "svelte/store";

// TODO(GIX-1071): constant for u and adapt related text too

export const accountsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => `${AppPath.Accounts}/?u=${universe}`
);

export const neuronsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => `${AppPath.Neurons}/?u=${universe}`
);

export const proposalsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => `${AppPath.Proposals}/?u=${universe}`
);

export const canistersPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => `${AppPath.Canisters}/?u=${universe}`
);
