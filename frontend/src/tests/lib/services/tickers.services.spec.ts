import * as icpSwapApi from "$lib/api/icp-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { loadTickers } from "$lib/services/tickers.services";
import { tickersStore } from "$lib/stores/tickers.store";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import type { TickersData } from "$lib/types/tickers";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { get } from "svelte/store";

describe("tickers.services", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
  });

  it("should load tickers from provider and set them in the store", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    // Mock ckUSDC ticker: 1 ICP = 0.1 ckUSDC (so ICP price = 0.1 USD)
    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      base_currency: "ckUSDC",
      target_id: icpLedgerCanisterId,
      last_price: "0.1", // 1 ICP = 0.1 ckUSDC
      volume_usd_24H: "1000",
    };

    // Mock another token ticker: 1 TOKEN = 2 ICP (so TOKEN price = 0.05 USD)
    const tokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      base_currency: "TOKEN",
      target_id: icpLedgerCanisterId,
      last_price: "2", // 1 TOKEN = 2 ICP
      volume_usd_24H: "500",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTicker,
    ]);

    expect(get(tickersStore)).toBeUndefined();

    await loadTickers();

    const result = get(tickersStore) as TickersData;
    expect(result).toBeDefined();
    expect(result[icpLedgerCanisterId]).toBe(0.1); // ICP price in USD
    expect(result[ckusdcLedgerCanisterId]).toBe(1); // ckUSDC price = 0.1 / 0.1 = 1 USD
    expect(result["token-canister-id"]).toBe(0.05); // TOKEN price = 0.1 / 2 = 0.05 USD
    expect(icpSwapApi.queryIcpSwapTickers).toHaveBeenCalledTimes(1);
  });

  it("should not load tickers if they are already loaded", async () => {
    const existingTickers: TickersData = {
      [LEDGER_CANISTER_ID.toText()]: 10,
      [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
    };

    // Set existing tickers
    tickersStore.set(existingTickers);

    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.1",
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await loadTickers();

    // Store should still have the original tickers
    expect(get(tickersStore)).toEqual(existingTickers);
    // API should not have been called
    expect(icpSwapApi.queryIcpSwapTickers).not.toHaveBeenCalled();
  });

  it("should set error state when provider throws an error", async () => {
    const error = new Error("Failed to fetch tickers");
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockRejectedValue(error);

    expect(get(tickersStore)).toBeUndefined();

    await loadTickers();

    expect(get(tickersStore)).toBe("error");
    expect(console.error).toHaveBeenCalledWith(error);
    expect(icpSwapApi.queryIcpSwapTickers).toHaveBeenCalledTimes(1);
  });

  it("should handle provider returning null tickers", async () => {
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(
      null as unknown as IcpSwapTicker[]
    );

    expect(get(tickersStore)).toBeUndefined();

    await loadTickers();

    expect(get(tickersStore)).toBe("error");
    expect(icpSwapApi.queryIcpSwapTickers).toHaveBeenCalledTimes(1);
  });

  it("should log error to console when provider fails", async () => {
    const error = new Error("Provider error");
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockRejectedValue(error);

    await loadTickers();

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
