import Plausible from "plausible-tracker";

vi.mock("plausible-tracker", () => {
  const enableAutoPageviews = vi.fn(() => () => {});
  const enableAutoOutboundTracking = vi.fn(() => () => {});
  const trackEvent = vi.fn();
  const trackPageview = vi.fn();

  return {
    default: vi.fn(() => ({
      enableAutoPageviews,
      enableAutoOutboundTracking,
      trackEvent,
      trackPageview,
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

  it("should track custom events", async () => {
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory("some-domain"),
    }));

    const { initAnalytics, analytics } = await import(
      "$lib/services/analytics.services"
    );

    const tracker = Plausible();
    initAnalytics();

    const testUrl = "/test-url";

    analytics.event("test-event", testUrl);
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      "test-event",
      {
        props: undefined,
      },
      { url: testUrl }
    );

    const eventProps = { category: "test", value: 123, enabled: true };
    analytics.event("test-event-with-props", testUrl, eventProps);
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      "test-event-with-props",
      {
        props: eventProps,
      },
      { url: testUrl }
    );
  });

  it("should track custom page views", async () => {
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory("some-domain"),
    }));

    const { initAnalytics, analytics } = await import(
      "$lib/services/analytics.services"
    );

    const tracker = Plausible();
    initAnalytics();
    const pageToTrack = "/test-page";

    analytics.pageView(pageToTrack);
    expect(tracker.trackPageview).toHaveBeenCalledWith({
      url: pageToTrack,
    });
  });
});
