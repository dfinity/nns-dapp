import { governanceMetrics } from "$lib/rest/governance-metrics.rest";

describe("Governance metrics", () => {
  beforeAll(() =>
    jest.spyOn(console, "error").mockImplementation(() => undefined)
  );

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return metrics as text", async () => {
    const text = `# HELP governance_stable_memory_size_bytes Size of the stable memory allocated by this canister measured in bytes.
# TYPE governance_stable_memory_size_bytes gauge
governance_stable_memory_size_bytes 503906304 1674031880551`;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(text),
        ok: true,
        status: 200,
      })
    );

    const metrics = await governanceMetrics();

    expect(metrics).toEqual(text);

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
