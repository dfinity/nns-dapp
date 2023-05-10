import { fetchTransactionRate } from "$lib/api/dashboard.api";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";
import { vi } from "vitest";

describe("Dashboard API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("should fetch a transaction rate", async () => {
    const data: DashboardMessageExecutionRateResponse = {
      message_execution_rate: [[1234, 300]],
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(data),
        ok: true,
        status: 200,
      })
    );

    const rate = await fetchTransactionRate();

    expect(rate.message_execution_rate).toEqual(data.message_execution_rate);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if return code invalid", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
      })
    );

    const rate = await fetchTransactionRate();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if endpoint throws an exception", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = vi.fn(() => Promise.reject("An API error"));

    const rate = await fetchTransactionRate();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
