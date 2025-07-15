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

      // First, get all ICP-based tickers
      const icpBasedTickers = tickers.filter(
        ({ target_id }) => target_id === icpLedgerCanisterId
      );

      // Group tickers by base_id to identify pairs with multiple tickers
      const tickersByBaseId = icpBasedTickers.reduce(
        (acc, ticker) => {
          const baseId = ticker.base_id;
          if (!acc[baseId]) acc[baseId] = [];

          acc[baseId].push(ticker);
          return acc;
        },
        {} as Record<string, IcpSwapTicker[]>
      );

      // Apply volume filter only when there are multiple tickers for the same pair
      const filteredTickers = Object.values(tickersByBaseId).flatMap(
        (tickersForPair) => {
          if (tickersForPair.length === 1) {
            // Single ticker for this pair - keep it regardless of volume
            return tickersForPair;
          } else {
            // Multiple tickers for this pair - filter by volume
            return tickersForPair.filter(
              (ticker) => Number(ticker.volume_usd_24H) > 0
            );
          }
        }
      );

      const ledgerCanisterIdToTicker: Record<string, IcpSwapTicker> =
        Object.fromEntries(
          filteredTickers.map((ticker) => [ticker.base_id, ticker])
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
