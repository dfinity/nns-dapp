import { AppPath } from "$lib/constants/routes.constants";
import { pageStore, type Page } from "$lib/derived/page.derived";
import { buildUrl } from "$lib/utils/navigation.utils";
import { derived, type Readable } from "svelte/store";

export const accountsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildUrl({ path: AppPath.Accounts, universe })
);

export const neuronsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildUrl({ path: AppPath.Neurons, universe })
);

export const proposalsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildUrl({ path: AppPath.Proposals, universe })
);

export const canistersPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildUrl({ path: AppPath.Canisters, universe })
);
