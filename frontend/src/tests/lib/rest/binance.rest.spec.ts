import { exchangeRateICPToUsd } from "$lib/rest/binance.rest";
import type { BinanceAvgPrice } from "$lib/types/binance";

describe("Binance API", () => {
  beforeAll(() =>
    jest.spyOn(console, "error").mockImplementation(() => undefined)
  );

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return an average price", async () => {
    const data: BinanceAvgPrice = { mins: 5, price: "5.43853359" };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(data),
        ok: true,
        status: 200,
      })
    );

    const rate = await exchangeRateICPToUsd();

    expect(rate.mins).toEqual(data.mins);
    expect(rate.price).toEqual(data.price);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if return code invalid", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
      })
    );

    const rate = await exchangeRateICPToUsd();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if endpoint throws an exception", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() => Promise.reject("An API error"));

    const rate = await exchangeRateICPToUsd();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
