import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";

// Sets the contents of the icpSwapTickersStore such that the result is the
// given map from ledger canister IDs to their USD prices.
// The price of ckUSDC is always set to 1 USD.
// Unless specified otherwise, the price of ICP is set to 10 USD.
export const setIcpSwapUsdPrices = (prices: Record<string, number>) => {
  const defaultIcpPrice = 10;
  const tickers = [];
  const entries = Object.entries(prices);
  let icpPrice =
    entries.find(
      ([ledgerCanisterId]) => ledgerCanisterId === LEDGER_CANISTER_ID.toText()
    )?.[1] ?? defaultIcpPrice;

  tickers.push({
    ...mockIcpSwapTicker,
    base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
    last_price: icpPrice,
  });

  for (const [ledgerCanisterId, price] of entries) {
    if (ledgerCanisterId === LEDGER_CANISTER_ID.toText()) {
      icpPrice = price;
      continue;
    }
    tickers.push({
      ...mockIcpSwapTicker,
      base_id: ledgerCanisterId,
      last_price: icpPrice / price,
    });
  }

  icpSwapTickersStore.set(tickers);
};
