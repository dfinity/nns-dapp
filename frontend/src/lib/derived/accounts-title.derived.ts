import { i18n } from "$lib/stores/i18n";
import { tokensStore, type TokensStore } from "$lib/stores/tokens.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { pageStore, type Page } from "./page.derived";

export const accountsTitleStore = derived<
  [Readable<Page>, TokensStore, Readable<I18n>],
  string
>([pageStore, tokensStore, i18n], ([{ universe }, tokensData, i18nObj]) => {
  const token = tokensData[universe]?.token;
  if (isNullish(token)) {
    return i18nObj.navigation.tokens;
  }
  return replacePlaceholders(i18nObj.navigation.universe_tokens, {
    $tokenSymbol: token.symbol,
  });
});
