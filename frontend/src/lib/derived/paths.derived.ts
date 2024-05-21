import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  ACTIONABLE_PROPOSALS_URL,
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
  ({ actionable, universe }) =>
    // When actionable is true, we show the all actionable proposals page
    actionable ? ACTIONABLE_PROPOSALS_URL : buildProposalsUrl({ universe })
);

export const canistersPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildCanistersUrl({ universe })
);
