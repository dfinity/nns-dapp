import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  buildAccountsUrl,
  buildCanistersUrl,
  buildNeuronsUrl,
  buildProposalsUrl,
} from "$lib/utils/navigation.utils";
import { derived, type Readable } from "svelte/store";

export const accountsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildAccountsUrl({ universe })
);

export const neuronsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildNeuronsUrl({ universe })
);

export const proposalsPathStore = derived<Readable<Page>, string>(
  pageStore,
  () => buildProposalsUrl()
);

export const canistersPathStore = derived<Readable<Page>, string>(
  pageStore,
  () => buildCanistersUrl()
);
