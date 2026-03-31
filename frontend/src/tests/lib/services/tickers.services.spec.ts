import * as icpSwapApi from "$lib/api/icp-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { loadTickers } from "$lib/services/tickers.services";
import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { tickersStore } from "$lib/stores/tickers.store";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { TickersProviders, type TickersData } from "$lib/types/tickers";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { get } from "svelte/store";

describe("tickers.services", () => {
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

  let icpSwapApySpy;

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();

    icpSwapApySpy = vi.spyOn(icpSwapApi, "queryIcpSwapTickers");

    icpSwapApySpy.mockResolvedValue([icpSwapCkusdcTicker, icpSwapTokenTicker]);
  });

  it("should load tickers from provider and set them in the store", async () => {
    expect(get(tickersStore)).toBeUndefined();
    expect(get(tickerProviderStore)).toBeUndefined();

    await loadTickers();

    const result = get(tickersStore) as TickersData;

    expect(result[icpLedgerCanisterId]).toBe(10); // ICP price in USD
    expect(result["token-canister-id"]).toBe(2); // TOKEN price in USD
    expect(get(tickerProviderStore)).toBe(TickersProviders.ICP_SWAP);
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
  });

  it("should set error state when provider fails", async () => {
    icpSwapApySpy.mockRejectedValue(new Error("error"));

    expect(get(tickersStore)).toBeUndefined();
    expect(get(tickerProviderStore)).toBeUndefined();

    await loadTickers();

    expect(get(tickersStore)).toBe("error");
    expect(get(tickerProviderStore)).toBeUndefined();
  });
});
