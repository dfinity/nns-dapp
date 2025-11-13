import * as kongSwapApi from "$lib/api/kong-swap.api";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { kongSwapTickerProvider } from "$lib/services/kong-swap.provider";
import type { KongSwapTicker } from "$lib/types/kong-swap";
import { ProviderErrors } from "$lib/types/tickers";
import { mockKongSwapTicker } from "$tests/mocks/kong-swap.mock";

describe("kong-swap.provider", () => {
  it("should successfully convert tickers to USD prices", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    // 10 ckUSDC = 1 ICP (so ICP price = 1/10 = 0.1 USD)
    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 0.1,
      liquidity_in_usd: 1000,
    };

    // 1 TOKEN = 0.2 ICP (so TOKEN price = 0.2 * 10 = 2 USD)
    const tokenTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 0.2,
      liquidity_in_usd: 500,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTicker,
    ]);

    const result = await kongSwapTickerProvider();

    expect(result).toEqual({
      [icpLedgerCanisterId]: 10,
      [ckusdcLedgerCanisterId]: 1,
      "token-canister-id": 2,
    });
  });

  it("should filter out tickers that are not ICP-based", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 25,
      liquidity_in_usd: 1000,
    };

    // Ticker with different target_currency (not ICP-based)
    const nonIcpTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "other-token-id",
      target_currency: "different-target-id",
      last_price: 5,
      liquidity_in_usd: 2000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      nonIcpTicker,
    ]);

    const result = await kongSwapTickerProvider();

    expect(result).not.toHaveProperty("other-token-id");
    expect(result).toHaveProperty(icpLedgerCanisterId);
    expect(result).toHaveProperty(ckusdcLedgerCanisterId);
  });

  it("should handle multiple tickers for the same pair by selecting one with liquidity", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 25,
      liquidity_in_usd: 1000,
    };

    // Multiple tickers for the same token pair
    const tokenTickerWithLiquidity: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2,
      liquidity_in_usd: 1000, // Has liquidity
    };

    const tokenTickerWithoutLiquidity: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2.5,
      liquidity_in_usd: 0, // No liquidity
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerWithLiquidity,
      tokenTickerWithoutLiquidity,
    ]);

    const result = await kongSwapTickerProvider();

    // Should use the ticker with liquidity (last_price: 2)
    expect(result["token-canister-id"]).toBe(0.08); // 0.04 * 2 = 0.08
  });

  it("should keep single ticker for a pair even if it has no liquidity", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 25,
      liquidity_in_usd: 1000,
    };

    // Single ticker with no liquidity - should still be kept
    const tokenTickerNoLiquidity: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2,
      liquidity_in_usd: 0, // No liquidity, but single ticker so kept
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerNoLiquidity,
    ]);

    const result = await kongSwapTickerProvider();

    expect(result["token-canister-id"]).toBe(0.08);
  });

  it("should handle multiple tickers with no liquidity by selecting none", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 25,
      liquidity_in_usd: 1000,
    };

    // Multiple tickers, all without liquidity - should return empty array (no ticker selected)
    const tokenTicker1: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2,
      liquidity_in_usd: 0,
    };

    const tokenTicker2: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2.5,
      liquidity_in_usd: 0,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTicker1,
      tokenTicker2,
    ]);

    const result = await kongSwapTickerProvider();

    // Should not include the token since no ticker with liquidity was found
    expect(result).not.toHaveProperty("token-canister-id");
    expect(result).toHaveProperty(icpLedgerCanisterId);
    expect(result).toHaveProperty(ckusdcLedgerCanisterId);
  });

  it("should filter out tickers with invalid prices (zero or non-finite)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 25,
      liquidity_in_usd: 1000,
    };

    const tokenTickerZeroPrice: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-zero-price",
      target_currency: icpLedgerCanisterId,
      last_price: 0,
      liquidity_in_usd: 1000,
    };

    const tokenTickerInvalidPrice: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-invalid-price",
      target_currency: icpLedgerCanisterId,
      last_price: Number.NaN,
      liquidity_in_usd: 1000,
    };

    const tokenTickerValidPrice: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-valid-price",
      target_currency: icpLedgerCanisterId,
      last_price: 2,
      liquidity_in_usd: 1000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tokenTickerZeroPrice,
      tokenTickerInvalidPrice,
      tokenTickerValidPrice,
    ]);

    const result = await kongSwapTickerProvider();

    expect(result).not.toHaveProperty("token-zero-price");
    expect(result).not.toHaveProperty("token-invalid-price");
    expect(result).toHaveProperty("token-valid-price");
    expect(result["token-valid-price"]).toBe(0.08);
  });

  it("should throw error when tickers data is null", async () => {
    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue(
      null as unknown as KongSwapTicker[]
    );

    await expect(kongSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.NO_DATA
    );
  });

  it("should throw error when ckUSDC ticker is missing", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();

    const tokenTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: "token-canister-id",
      target_currency: icpLedgerCanisterId,
      last_price: 2,
      liquidity_in_usd: 1000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      tokenTicker,
    ]);

    await expect(kongSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_CKUSDC_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (zero)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: 0, // Invalid: zero price
      liquidity_in_usd: 1000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(kongSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (NaN)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: Number.NaN, // Invalid: NaN
      liquidity_in_usd: 1000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(kongSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });

  it("should throw error when ckUSDC ticker has invalid price (Infinity)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: KongSwapTicker = {
      ...mockKongSwapTicker,
      base_currency: ckusdcLedgerCanisterId,
      target_currency: icpLedgerCanisterId,
      last_price: Number.POSITIVE_INFINITY, // Invalid: Infinity
      liquidity_in_usd: 1000,
    };

    vi.spyOn(kongSwapApi, "queryKongSwapTickers").mockResolvedValue([
      ckusdcTicker,
    ]);

    await expect(kongSwapTickerProvider()).rejects.toThrow(
      ProviderErrors.INVALID_ICP_PRICE
    );
  });
});
