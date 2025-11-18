import { queryKongSwapTickers } from "$lib/api/kong-swap.api";
import { KONG_SWAP_URL } from "$lib/constants/environment.constants";
import { mockKongSwapTicker } from "$tests/mocks/kong-swap.mock";

describe("kong-swap.api", () => {
  it("should fetch KongSwap tickers", async () => {
    const tickersResponse = [mockKongSwapTicker];

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => tickersResponse,
    } as Response);

    expect(await queryKongSwapTickers()).toEqual(tickersResponse);

    expect(global.fetch).toBeCalledWith(
      new URL(`${KONG_SWAP_URL}/api/coingecko/tickers`)
    );
    expect(global.fetch).toBeCalledTimes(1);
  });

  it("should throw if fetch fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    await expect(queryKongSwapTickers()).rejects.toThrow(
      new Error("Failed to fetch ticker information from KongSwap")
    );
  });
});
