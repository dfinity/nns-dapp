import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { ProviderErrors, type TickersData } from "$lib/types/tickers";
import { mapEntries } from "$lib/utils/utils";
import { isNullish } from "@dfinity/utils";

// The tickers come from ICP Swap, so a field can be missing or hold something
// that is not a number. Such a field counts as 0.
const toAmount = (value: string): number => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

// Anybody can create an ICP Swap pool, so a token can have several pools and
// each pool reports its own price. Keep the pool with the most liquidity,
// because an attacker must lock more value than the real pool to be selected.
// A tie goes to the higher 24h volume, then to the first pool in the feed.
const selectMostLiquidTicker = (tickers: IcpSwapTicker[]): IcpSwapTicker =>
  tickers.reduce((selected, ticker) => {
    const liquidityDifference =
      toAmount(ticker.liquidity_in_usd) - toAmount(selected.liquidity_in_usd);
    if (liquidityDifference !== 0) {
      return liquidityDifference > 0 ? ticker : selected;
    }
    const volumeDifference =
      toAmount(ticker.volume_usd_24H) - toAmount(selected.volume_usd_24H);
    return volumeDifference > 0 ? ticker : selected;
  });

const adapter = (tickers: IcpSwapTicker[]): TickersData => {
  if (isNullish(tickers)) throw new Error(ProviderErrors.NO_DATA);

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

  // Keep one ticker per pair: the one with the most liquidity.
  const ledgerCanisterIdToTicker: Record<string, IcpSwapTicker> = mapEntries({
    obj: tickersByBaseId,
    mapFn: ([baseId, tickersForPair]) => [
      baseId,
      selectMostLiquidTicker(tickersForPair),
    ],
  });

  const ckusdcTicker =
    ledgerCanisterIdToTicker[CKUSDC_LEDGER_CANISTER_ID.toText()];
  if (isNullish(ckusdcTicker)) {
    throw new Error(ProviderErrors.INVALID_CKUSDC_PRICE);
  }

  const icpPriceInCkusdc = Number(ckusdcTicker?.last_price);

  if (icpPriceInCkusdc <= 0 || !Number.isFinite(icpPriceInCkusdc)) {
    throw new Error(ProviderErrors.INVALID_ICP_PRICE);
  }

  const ledgerCanisterIdToUsdPrice: Record<string, number> = mapEntries({
    obj: ledgerCanisterIdToTicker,
    mapFn: ([ledgerCanisterId, ticker]) => {
      const lastPrice = Number(ticker.last_price);
      if (lastPrice <= 0 || !Number.isFinite(lastPrice)) {
        return undefined;
      }
      return [ledgerCanisterId, icpPriceInCkusdc / lastPrice];
    },
  });

  // There is no ticker for ICP to ICP but we do want the ICP price in ckUSDC.
  ledgerCanisterIdToUsdPrice[LEDGER_CANISTER_ID.toText()] = icpPriceInCkusdc;

  return ledgerCanisterIdToUsdPrice;
};

export const icpSwapTickerProvider = async (): Promise<TickersData> => {
  const tickers = await queryIcpSwapTickers();
  return adapter(tickers);
};
