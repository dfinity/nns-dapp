import Plausible from "plausible-tracker";

vi.mock("plausible-tracker", () => {
  const enableAutoPageviews = vi.fn(() => () => {});
  const enableAutoOutboundTracking = vi.fn(() => () => {});

  return {
    default: vi.fn(() => ({
      enableAutoPageviews,
      enableAutoOutboundTracking,
    })),
  };
});

describe("analytics service", () => {
  const getEnvVarsFactory = (plausibleDomain: string) => () => ({
    plausibleDomain,
    featureFlags: "{}",
  });

  beforeEach(() => {
    vi.resetModules();
  });

  it("should not do anything if domain is not set", async () => {
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory(undefined),
    }));

    const { initAnalytics } = await import("$lib/services/analytics.services");

    expect(Plausible).toHaveBeenCalledTimes(0);
    initAnalytics();
    expect(Plausible).toHaveBeenCalledTimes(0);
  });

  it("should initialize Plausible with correct configuration", async () => {
    const plausibleDomain = "test-domain";
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory(plausibleDomain),
    }));

    const { initAnalytics } = await import("$lib/services/analytics.services");

    expect(Plausible).toHaveBeenCalledTimes(0);
    initAnalytics();

    expect(Plausible).toHaveBeenCalledTimes(1);
    expect(Plausible).toHaveBeenCalledWith({
      domain: plausibleDomain,
      hashMode: false,
      trackLocalhost: false,
    });
  });

  it("should enable auto page views", async () => {
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory("some-domain"),
    }));

    const { initAnalytics } = await import("$lib/services/analytics.services");

    const tracker = Plausible();

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(0);

    initAnalytics();

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(1);
  });
});
