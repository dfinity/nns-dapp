import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { mapEntries } from "$lib/utils/utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export type IcpSwapUsdPricesStoreData =
  | Record<string, number>
  | undefined
  | "error";

export type IcpSwapUsdPricesStore = Readable<IcpSwapUsdPricesStoreData>;

/// Holds a record mapping ledger canister IDs to the ckUSDC price of their
/// tokens.
export const icpSwapUsdPricesStore: IcpSwapUsdPricesStore = derived(
  icpSwapTickersStore,
  (tickers) => {
    if (isNullish(tickers) || tickers === "error") {
      return tickers;
    }
    // The contents of icpSwapTickersStore come from ICP Swap, so there's no
    // guarantee that it's format is as expected.
    try {
      const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
      const ledgerCanisterIdToTicker: Record<string, IcpSwapTicker> =
        Object.fromEntries(
          tickers
            // Only keep ICP based tickers
            .filter((ticker) => ticker.target_id === icpLedgerCanisterId)
            .map((ticker) => [ticker.base_id, ticker])
        );

      const ckusdcTicker =
        ledgerCanisterIdToTicker[CKUSDC_LEDGER_CANISTER_ID.toText()];
      if (isNullish(ckusdcTicker)) {
        return "error";
      }

      const icpPriceInCkusdc = Number(ckusdcTicker?.last_price);

      if (icpPriceInCkusdc === 0 || !Number.isFinite(icpPriceInCkusdc)) {
        return "error";
      }

      const ledgerCanisterIdToUsdPrice: Record<string, number> = mapEntries({
        obj: ledgerCanisterIdToTicker,
        mapFn: ([ledgerCanisterId, ticker]) => {
          const lastPrice = Number(ticker.last_price);
          if (lastPrice === 0 || !Number.isFinite(lastPrice)) {
            return undefined;
          }
          return [
            ledgerCanisterId,
            icpPriceInCkusdc / Number(ticker.last_price),
          ];
        },
      });

      // There is no ticker for ICP to ICP but we do want the ICP price in ckUSDC.
      ledgerCanisterIdToUsdPrice[LEDGER_CANISTER_ID.toText()] =
        icpPriceInCkusdc;

      return ledgerCanisterIdToUsdPrice;
    } catch (error) {
      console.error(error);
      return "error";
    }
  }
);
