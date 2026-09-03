import { importedTokenLedgerCanisterIdsStore } from "$lib/derived/imported-tokens.derived";
import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
import { tickersStore } from "$lib/stores/tickers.store";
import { getLedgerCanisterIdFromToken } from "$lib/utils/token.utils";
import { isNullish, type Token } from "@dfinity/utils";
import { derived } from "svelte/store";

export const tokenPriceStore = (token: Token) => {
  return derived(
    [
      tokensByLedgerCanisterIdStore,
      tickersStore,
      importedTokenLedgerCanisterIdsStore,
    ],
    ([
      $tokensByLedgerCanisterIdStore,
      tickers,
      $importedTokenLedgerCanisterIdsStore,
    ]) => {
      const ledgerCanisterId = getLedgerCanisterIdFromToken({
        token,
        tokensByLedgerCanisterId: $tokensByLedgerCanisterIdStore,
        importedTokenLedgerCanisterIds: $importedTokenLedgerCanisterIdsStore,
      });

      if (
        isNullish(ledgerCanisterId) ||
        isNullish(tickers) ||
        tickers === "error"
      )
        return undefined;

      return tickers[ledgerCanisterId];
    }
  );
};
