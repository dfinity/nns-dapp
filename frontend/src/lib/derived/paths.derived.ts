import { pageStore, type Page } from "$lib/derived/page.derived";
import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
import {
  buildAccountsUrl,
  buildCanistersUrl,
  buildNeuronsUrl,
  buildProposalsUrl,
} from "$lib/utils/navigation.utils";
import { derived, type Readable } from "svelte/store";

export const accountsPathStore = derived<
  [Readable<Page>, Readable<boolean>],
  string
>([pageStore, ENABLE_MY_TOKENS], ([{ universe }, tokensEnabled]) =>
  buildAccountsUrl({ universe, tokensEnabled })
);

export const neuronsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildNeuronsUrl({ universe })
);

export const proposalsPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildProposalsUrl({ universe })
);

export const canistersPathStore = derived<Readable<Page>, string>(
  pageStore,
  ({ universe }) => buildCanistersUrl({ universe })
);
