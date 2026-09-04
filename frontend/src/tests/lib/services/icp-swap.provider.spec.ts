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

  it("should handle multiple tickers for the same pair by selecting the most liquid one", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "1000",
    };

    // Multiple tickers for the same token pair
    const mostLiquidTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "10000",
      volume_usd_24H: "1", // Less volume
    };

    const lessLiquidTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2.5",
      liquidity_in_usd: "9999",
      volume_usd_24H: "1000", // More volume
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      lessLiquidTokenTicker,
      mostLiquidTokenTicker,
    ]);

    const result = await icpSwapTickerProvider();

    // Should use the most liquid ticker (last_price: "2")
    expect(result["token-canister-id"]).toBe(0.02); // 0.04 / 2 = 0.02
  });

  it("should select the most liquid ticker whatever the order of the tickers", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "1000",
    };

    // The pool of the token holds real liquidity but nobody traded it today.
    const realTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "10000",
      volume_usd_24H: "0",
    };

    // The pool of the attacker holds almost nothing and has one wash trade.
    const attackerTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "0.0001",
      liquidity_in_usd: "5",
      volume_usd_24H: "1",
    };

    for (const tickers of [
      [ckusdcTicker, attackerTokenTicker, realTokenTicker],
      [ckusdcTicker, realTokenTicker, attackerTokenTicker],
    ]) {
      vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);

      const result = await icpSwapTickerProvider();

      // The price comes from the real pool: 0.04 / 2 = 0.02
      expect(result["token-canister-id"]).toBe(0.02);
    }
  });

  it("should ignore a ckUSDC ticker with less liquidity", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const realCkusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "0",
    };

    const attackerCkusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "400",
      liquidity_in_usd: "5",
      volume_usd_24H: "1",
    };

    const tokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "10000",
      volume_usd_24H: "0",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      attackerCkusdcTicker,
      realCkusdcTicker,
      tokenTicker,
    ]);

    const result = await icpSwapTickerProvider();

    expect(result[icpLedgerCanisterId]).toBe(0.04);
    expect(result[ckusdcLedgerCanisterId]).toBe(1);
    expect(result["token-canister-id"]).toBe(0.02);
  });

  it("should select the ticker with more volume when the liquidity is equal", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "1000",
    };

    const lessTradedTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "4",
      liquidity_in_usd: "1000",
      volume_usd_24H: "1",
    };

    const moreTradedTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "1000",
      volume_usd_24H: "5",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      lessTradedTokenTicker,
      moreTradedTokenTicker,
    ]);

    const result = await icpSwapTickerProvider();

    // The price comes from the more traded pool: 0.04 / 2 = 0.02
    expect(result["token-canister-id"]).toBe(0.02);
  });

  it("should count a missing or non-numeric liquidity as zero", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "1000",
    };

    const tickerWithoutLiquidity: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "4",
      liquidity_in_usd: undefined as unknown as string,
      volume_usd_24H: "1000",
    };

    const tickerWithBrokenLiquidity: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "8",
      liquidity_in_usd: "a lot",
      volume_usd_24H: "1000",
    };

    const tickerWithLiquidity: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "1",
      volume_usd_24H: "0",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      tickerWithoutLiquidity,
      tickerWithBrokenLiquidity,
      tickerWithLiquidity,
    ]);

    const result = await icpSwapTickerProvider();

    // The only ticker with a liquidity wins: 0.04 / 2 = 0.02
    expect(result["token-canister-id"]).toBe(0.02);
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

  it("should handle multiple tickers with no volume by selecting the most liquid one", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "0.04",
      liquidity_in_usd: "617000",
      volume_usd_24H: "1000",
    };

    // Multiple tickers, all without volume
    const lessLiquidTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2.5",
      liquidity_in_usd: "9999",
      volume_usd_24H: "0",
    };

    const mostLiquidTokenTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-canister-id",
      target_id: icpLedgerCanisterId,
      last_price: "2",
      liquidity_in_usd: "10000",
      volume_usd_24H: "0",
    };

    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue([
      ckusdcTicker,
      lessLiquidTokenTicker,
      mostLiquidTokenTicker,
    ]);

    const result = await icpSwapTickerProvider();

    // The most liquid ticker gives the price: 0.04 / 2 = 0.02
    expect(result["token-canister-id"]).toBe(0.02);
    expect(result).toHaveProperty(icpLedgerCanisterId);
    expect(result).toHaveProperty(ckusdcLedgerCanisterId);
  });

  it("should filter out tickers with invalid prices (zero, negative or non-finite)", async () => {
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

    const tokenTickerNegativePrice: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: "token-negative-price",
      target_id: icpLedgerCanisterId,
      last_price: "-1",
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
      tokenTickerNegativePrice,
      tokenTickerValidPrice,
    ]);

    const result = await icpSwapTickerProvider();

    expect(result).not.toHaveProperty("token-zero-price");
    expect(result).not.toHaveProperty("token-invalid-price");
    expect(result).not.toHaveProperty("token-negative-price");
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

  it("should throw error when ckUSDC ticker has invalid price (negative)", async () => {
    const icpLedgerCanisterId = LEDGER_CANISTER_ID.toText();
    const ckusdcLedgerCanisterId = CKUSDC_LEDGER_CANISTER_ID.toText();

    const ckusdcTicker: IcpSwapTicker = {
      ...mockIcpSwapTicker,
      base_id: ckusdcLedgerCanisterId,
      target_id: icpLedgerCanisterId,
      last_price: "-1", // Invalid: negative price
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
