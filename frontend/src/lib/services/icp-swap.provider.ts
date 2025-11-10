import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import type { TickersData } from "$lib/types/tickers";
import { mapEntries } from "$lib/utils/utils";
import { isNullish } from "@dfinity/utils";

const adapter = (tickers: IcpSwapTicker[]): TickersData => {
  if (isNullish(tickers)) throw new Error("No tickers data");

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
          return (
            tickersForPair.find(
              (ticker) => Number(ticker.volume_usd_24H) > 0
            ) ?? []
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
      throw new Error("No ckUsdc data");
    }

    const icpPriceInCkusdc = Number(ckusdcTicker?.last_price);

    if (icpPriceInCkusdc === 0 || !Number.isFinite(icpPriceInCkusdc)) {
      throw new Error("Invalid icp Price");
    }

    const ledgerCanisterIdToUsdPrice: Record<string, number> = mapEntries({
      obj: ledgerCanisterIdToTicker,
      mapFn: ([ledgerCanisterId, ticker]) => {
        const lastPrice = Number(ticker.last_price);
        if (lastPrice === 0 || !Number.isFinite(lastPrice)) {
          return undefined;
        }
        return [ledgerCanisterId, icpPriceInCkusdc / Number(ticker.last_price)];
      },
    });

    // There is no ticker for ICP to ICP but we do want the ICP price in ckUSDC.
    ledgerCanisterIdToUsdPrice[LEDGER_CANISTER_ID.toText()] = icpPriceInCkusdc;

    return ledgerCanisterIdToUsdPrice;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid data");
  }
};

export const icpSwapTickerProvider = async (): Promise<TickersData> => {
  const tickers = await queryIcpSwapTickers();
  return adapter(tickers);
};
