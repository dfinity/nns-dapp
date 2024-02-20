import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
import { i18n } from "$lib/stores/i18n";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { pageStore, type Page } from "./page.derived";

export const accountsTitleStore = derived<
  [Readable<Page>, Readable<Record<string, IcrcTokenMetadata>>, Readable<I18n>],
  string
>(
  [pageStore, tokensByUniverseIdStore, i18n],
  ([{ universe }, tokensByUniverseId, i18nObj]) => {
    const token = tokensByUniverseId[universe];
    if (isNullish(token)) {
      return i18nObj.navigation.tokens;
    }
    return replacePlaceholders(i18nObj.navigation.universe_tokens, {
      $tokenSymbol: token.symbol,
    });
  }
);
