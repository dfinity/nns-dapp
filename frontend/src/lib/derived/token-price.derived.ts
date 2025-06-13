import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
import { getLedgerCanisterIdFromToken } from "$lib/utils/token.utils";
import {
  isNullish,
  type TokenAmount,
  type TokenAmountV2,
} from "@dfinity/utils";
import { derived } from "svelte/store";

export const tokenPriceStore = (amount: TokenAmountV2 | TokenAmount) => {
  return derived(
    [tokensByLedgerCanisterIdStore, icpSwapUsdPricesStore],
    ([$tokensByLedgerCanisterIdStore, $icpSwapUsdPricesStore]) => {
      const ledgerCanisterId = getLedgerCanisterIdFromToken(
        amount.token,
        $tokensByLedgerCanisterIdStore
      );

      if (
        isNullish(ledgerCanisterId) ||
        isNullish($icpSwapUsdPricesStore) ||
        $icpSwapUsdPricesStore === "error"
      )
        return undefined;

      return $icpSwapUsdPricesStore[ledgerCanisterId];
    }
  );
};
