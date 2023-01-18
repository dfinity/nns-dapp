import { governanceMetrics } from "$lib/rest/governance-metrics.rest";
import { governanceMetricsText } from "../../mocks/metrics.mock";

describe("Governance metrics", () => {
  beforeAll(() =>
    jest.spyOn(console, "error").mockImplementation(() => undefined)
  );

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return metrics as text", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(governanceMetricsText),
        ok: true,
        status: 200,
      })
    );

    const metrics = await governanceMetrics();

    expect(metrics).toEqual(governanceMetricsText);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if return code is invalid", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
      })
    );

    const metrics = await governanceMetrics();

    expect(metrics).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if endpoint throws an exception", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() => Promise.reject("An API error"));

    const metrics = await governanceMetrics();

    expect(metrics).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
