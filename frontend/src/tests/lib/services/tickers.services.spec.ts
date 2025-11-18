import * as icpSwapApi from "$lib/api/icp-swap.api";
import * as kongSwapApi from "$lib/api/kong-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { loadTickers, providers } from "$lib/services/tickers.services";
import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { tickersStore } from "$lib/stores/tickers.store";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import type { KongSwapTicker } from "$lib/types/kong-swap";
import type { TickersData } from "$lib/types/tickers";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockKongSwapTicker } from "$tests/mocks/kong-swap.mock";
import { get } from "svelte/store";

describe("tickers.services", () => {
  const primaryProvider = providers[0];
  const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
  const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

  const icpSwapCkusdcTicker: IcpSwapTicker = {
    ...mockIcpSwapTicker,
    base_id: ckusdcLedgerCanisterId,
    base_currency: "ckUSDC",
    target_id: icpLedgerCanisterId,
    last_price: "10", // 1 ICP = 10 ckUSDC
    volume_usd_24H: "1000",
  };

  const icpSwapTokenTicker: IcpSwapTicker = {
    ...mockIcpSwapTicker,
    base_id: "token-canister-id",
    base_currency: "TOKEN",
    target_id: icpLedgerCanisterId,
    last_price: "5", // 1 ICP = 5 Token, so TOKEN price = 2 ckUSDC
    volume_usd_24H: "500",
  };

  const kongSwapCkusdcTicker: KongSwapTicker = {
    ...mockKongSwapTicker,
    base_currency: ckusdcLedgerCanisterId,
    target_currency: icpLedgerCanisterId,
    last_price: 0.1, // 1 ICP = 10 ckUSDC
    liquidity_in_usd: 1000,
  };

  const kongSwapTokenTicker: KongSwapTicker = {
    ...mockKongSwapTicker,
    base_currency: "token-canister-id",
    target_currency: icpLedgerCanisterId,
    last_price: 0.2, // 1 ICP = 0.2 Token, so TOKEN price = 2 USD
    liquidity_in_usd: 500,
  };

  let icpSwapApySpy;
  let kongSwapApiSpy;

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();

    icpSwapApySpy = vi.spyOn(icpSwapApi, "queryIcpSwapTickers");
    kongSwapApiSpy = vi.spyOn(kongSwapApi, "queryKongSwapTickers");

    icpSwapApySpy.mockResolvedValue([icpSwapCkusdcTicker, icpSwapTokenTicker]);
    kongSwapApiSpy.mockResolvedValue([
      kongSwapCkusdcTicker,
      kongSwapTokenTicker,
    ]);
  });

  it("should load tickers from primary provider and set them in the store", async () => {
    expect(get(tickersStore)).toBeUndefined();
    expect(get(tickerProviderStore)).toBeUndefined();

    await loadTickers();

    const result = get(tickersStore) as TickersData;

    expect(result[icpLedgerCanisterId]).toBe(10); // ICP price in USD
    expect(result["token-canister-id"]).toBe(2); // TOKEN price in USD
    expect(get(tickerProviderStore)).toBe(primaryProvider);
  });

  it("should fallback to secondary provider when primary fails", async () => {
    // Mock primary provider failing
    const secondaryProvider = providers[1];
    if (primaryProvider === "icp-swap") {
      icpSwapApySpy.mockRejectedValue(new Error("ICP Swap failed"));
    } else {
      kongSwapApiSpy.mockRejectedValue(new Error("Kong Swap failed"));
    }

    expect(get(tickersStore)).toBeUndefined();
    expect(get(tickerProviderStore)).toBeUndefined();

    await loadTickers();

    const result = get(tickersStore) as TickersData;

    expect(result[icpLedgerCanisterId]).toBe(10); // ICP price in USD
    expect(result["token-canister-id"]).toBe(2); // TOKEN price in USD
    expect(get(tickerProviderStore)).toBe(secondaryProvider);
  });

  it("should not load tickers if they are already loaded", async () => {
    const existingTickers: TickersData = {
      [LEDGER_CANISTER_ID.toText()]: 10,
      [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
    };

    tickersStore.set(existingTickers);

    await loadTickers();

    expect(get(tickersStore)).toEqual(existingTickers);
    expect(icpSwapApySpy).not.toHaveBeenCalled();
    expect(kongSwapApiSpy).not.toHaveBeenCalled();
  });

  it("should set error state when all providers fail", async () => {
    icpSwapApySpy.mockRejectedValue(new Error("error"));
    kongSwapApiSpy.mockRejectedValue(new Error("error"));

    expect(get(tickersStore)).toBeUndefined();
    expect(get(tickerProviderStore)).toBeUndefined();

    await loadTickers();

    expect(get(tickersStore)).toBe("error");
    expect(get(tickerProviderStore)).toBeUndefined();
  });
});
