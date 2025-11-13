import { queryKongSwapTickers } from "$lib/api/kong-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { KongSwapTicker } from "$lib/types/kong-swap";
import { ProviderErrors, type TickersData } from "$lib/types/tickers";
import { mapEntries } from "$lib/utils/utils";
import { isNullish } from "@dfinity/utils";

const adapter = (tickers: KongSwapTicker[]): TickersData => {
  if (isNullish(tickers)) throw new Error(ProviderErrors.NO_DATA);

  // The contents of kongSwapTickers come from Kong Swap, so there's no
  // guarantee that its format is as expected.
  const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();

  // First, get all ICP-based tickers
  const icpBasedTickers = tickers.filter(
    ({ target_currency }) => target_currency === icpLedgerCanisterId
  );

  const ledgerCanisterIdToTicker: Record<string, KongSwapTicker> =
    Object.fromEntries(
      icpBasedTickers.map((ticker) => [ticker.base_currency, ticker])
    );

  const ckusdcTicker =
    ledgerCanisterIdToTicker[CKUSDC_LEDGER_CANISTER_ID.toText()];
  if (isNullish(ckusdcTicker)) {
    throw new Error(ProviderErrors.INVALID_CKUSDC_PRICE);
  }

  // For ckUSDC/ICP pair, last_price represents how many ICP per 1 ckUSDC
  // Since 1 ckUSDC ≈ 1 USD, we can use this to get ICP price in USD
  const icpPriceInCkusdc = 1 / Number(ckusdcTicker.last_price);

  if (icpPriceInCkusdc === 0 || !Number.isFinite(icpPriceInCkusdc)) {
    throw new Error(ProviderErrors.INVALID_ICP_PRICE);
  }

  const ledgerCanisterIdToUsdPrice: Record<string, number> = mapEntries({
    obj: ledgerCanisterIdToTicker,
    mapFn: ([ledgerCanisterId, ticker]) => {
      const lastPrice = Number(ticker.last_price);
      if (lastPrice === 0 || !Number.isFinite(lastPrice)) {
        return undefined;
      }
      // last_price represents price in ICP, so multiply by ICP price in USD
      const priceInIcp = lastPrice;
      const priceInUsd = icpPriceInCkusdc * priceInIcp;
      return [ledgerCanisterId, priceInUsd];
    },
  });

  // There is no ticker for ICP to ICP but we do want the ICP price in ckUSDC.
  ledgerCanisterIdToUsdPrice[LEDGER_CANISTER_ID.toText()] = icpPriceInCkusdc;

  return ledgerCanisterIdToUsdPrice;
};

export const kongSwapTickerProvider = async (): Promise<TickersData> => {
  const tickers = await queryKongSwapTickers();
  return adapter(tickers);
};
