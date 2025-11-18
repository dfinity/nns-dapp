import * as icpSwapApi from "$lib/api/icp-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickerProvider } from "$lib/services/icp-swap.provider";
import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { ProviderErrors } from "$lib/types/tickers";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";

describe("icp-swap.provider", () => {
  it("should successfully convert tickers to USD prices", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    // Mock ckUSDC ticker: 1 ICP = 0.04 ckUSDC (so ICP price = 0.04 USD)
    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      base_currency: "ckUSDC",
      target_id: icpLedgerCanisterId,
      last_price: "0.04", // 1 ICP = 0.04 ckUSDC
      volume_usd_24H: "1000",
    };

    // Mock another token ticker: 1 TOKEN = 2 ICP (so TOKEN price = 0.08 USD)
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

    const result = await icpSwapTickerProvider();

    expect(result).toEqual({
      [icpLedgerCanisterId]: 0.04, // ICP price in USD
      [ckusdcLedgerCanisterId]: 1, // ckUSDC price = 0.04 / 0.04 = 1 USD
      "token-canister-id": 0.02, // TOKEN price = 0.04 / 2 = 0.02 USD
    });
  });

  it("should filter out tickers that are not ICP-based", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      volume_usd_24H: "1000",
    };

    // Ticker with different target_id (not ICP-based)
    const nonIcpTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "other-token-id",
      target_id: "different-target-id",
      last_price: "5",
      volume_usd_24H: "2000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      nonIcpTicker,
    ]);

    const result = await icpSwapTickerProvider();

    expect(result).not.toHaveProperty("other-token-id");
    expect(result).toHaveProperty(icpLedgerCanisterId);
    expect(result).toHaveProperty(ckusdcLedgerCanisterId);
  });

  it("should handle multiple tickers for the same pair by selecting one with volume", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      volume_usd_24H: "1000",
    };

    // Multiple tickers for the same token pair
    const tokenTickerWithVolume: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      volume_usd_24H: "1000", // Has volume
    };

    const tokenTickerWithoutVolume: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2.5",
      volume_usd_24H: "0", // No volume
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerWithVolume,
      tokenTickerWithoutVolume,
    ]);

    const result = await icpSwapTickerProvider();

    // Should use the ticker with volume (last_price: "2")
    expect(result["token-canister-id"]).toBe(0.02); // 0.04 / 2 = 0.02
  });

  it("should keep single ticker for a pair even if it has no volume", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      volume_usd_24H: "1000",
    };

    // Single ticker with no volume - should still be kept
    const tokenTickerNoVolume: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      volume_usd_24H: "0", // No volume, but single ticker so kept
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerNoVolume,
    ]);

    const result = await icpSwapTickerProvider();

    expect(result["token-canister-id"]).toBe(0.02);
  });

  it("should handle multiple tickers with no volume by selecting the first one", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      volume_usd_24H: "1000",
    };

    // Multiple tickers, all without volume - should return empty array (no ticker selected)
    const tokenTicker1: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      volume_usd_24H: "0",
    };

    const tokenTicker2: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2.5",
      volume_usd_24H: "0",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTicker1,
      tokenTicker2,
    ]);

    const result = await icpSwapTickerProvider();

    // Should not include the token since no ticker with volume was found
    expect(result).not.toHaveProperty("token-canister-id");
    expect(result).toHaveProperty(icpLedgerCanisterId);
    expect(result).toHaveProperty(ckusdcLedgerCanisterId);
  });

  it("should filter out tickers with invalid prices (zero or non-finite)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      volume_usd_24H: "1000",
    };

    const tokenTickerZeroPrice: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-zero-price",
      target_id: icpLedgerCanisterId,
      last_price: "0",
      volume_usd_24H: "1000",
    };

    const tokenTickerInvalidPrice: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-invalid-price",
      target_id: icpLedgerCanisterId,
      last_price: "NaN",
      volume_usd_24H: "1000",
    };

    const tokenTickerValidPrice: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-valid-price",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerZeroPrice,
      tokenTickerInvalidPrice,
      tokenTickerValidPrice,
    ]);

    const result = await icpSwapTickerProvider();

    expect(result).not.toHaveProperty("token-zero-price");
    expect(result).not.toHaveProperty("token-invalid-price");
    expect(result).toHaveProperty("token-valid-price");
    expect(result["token-valid-price"]).toBe(0.02);
  });

  it("should throw error when tickers data is null", async () => {
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(
      null as unknown as IcpSwapTicker[]
    );

    await expect(icpSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.NO_DATA
    );
  });

  it("should throw error when ckUSDC ticker is missing", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();

    const tokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      tokenTicker,
    ]);

    await expect(icpSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_CKUSDC_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (zero)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0", // Invalid: zero price
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(icpSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (NaN)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "NaN", // Invalid: NaN
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(icpSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (Infinity)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "Infinity", // Invalid: Infinity
      volume_usd_24H: "1000",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(icpSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });
});
