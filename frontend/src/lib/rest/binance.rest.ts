import type { BinanceAvgPrice } from "$lib/types/binance";

/**
 * Current average price for a symbol - ICP - provided by Binance.
 *
 * Documentation:
 * - https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#general-api-information
 * - https://binance-docs.github.io/apidocs/spot/en/#current-average-price
 *
 */
export const exchangeRateICPToUsd =
  async (): Promise<BinanceAvgPrice | null> => {
    try {
      // TODO: extract .env
      const response = await fetch(
        "https://api.binance.com/api/v3/avgPrice?symbol=ICPUSDT"
      );

      if (!response.ok) {
        // We silence any error here - if no result is found, no informative information shall be displayed
        console.error("Error fetching symbol average price", response);
        return null;
      }

      return response.json();
    } catch (err: unknown) {
      // We silence any error here - if no result is found, no informative information shall be displayed
      console.error("Unexpected error fetching symbol average price", err);
      return null;
    }
  };
