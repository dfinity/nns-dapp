import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
import { tickersStore } from "$lib/stores/tickers.store";
import { getLedgerCanisterIdFromToken } from "$lib/utils/token.utils";
import { isNullish, type Token } from "@dfinity/utils";
import { derived } from "svelte/store";

export const tokenPriceStore = (token: Token) => {
  return derived(
    [tokensByLedgerCanisterIdStore, tickersStore],
    ([$tokensByLedgerCanisterIdStore, tickers]) => {
      const ledgerCanisterId = getLedgerCanisterIdFromToken(
        token,
        $tokensByLedgerCanisterIdStore
      );

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
