import { page } from "$app/state";
import Plausible from "plausible-tracker";

let currentUrl = new URL("/", "http://localhost");
vi.mock("$app/state", () => ({
  page: {
    get url() {
      return currentUrl;
    },
    set url(value) {
      currentUrl = value;
    },
  },
}));

vi.mock("plausible-tracker", () => {
  const trackEvent = vi.fn();
  const trackPageview = vi.fn();

  return {
    default: vi.fn(() => ({
      trackEvent,
      trackPageview,
    })),
  };
});

describe("analytics service", () => {
  const plausibleDomain = "test-domain";
  const getEnvVarsFactory = (plausibleDomain: string) => () => ({
    plausibleDomain,
    featureFlags: "{}",
  });

  beforeEach(() => {
    vi.doMock("$lib/utils/env-vars.utils", () => ({
      getEnvVars: getEnvVarsFactory(plausibleDomain),
    }));
  });

  it("should initialize Plausible with correct configuration", async () => {
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
    const { initAnalytics, analytics } = await import(
      "$lib/services/analytics.services"
    );

    const tracker = Plausible();
    initAnalytics();

    const testUrl = "/test-url";
    page.url = new URL(testUrl, "http://localhost");

    analytics.event("test-event");
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      "test-event",
      {
        props: undefined,
      },
      { url: testUrl }
    );

    const eventProps = { category: "test", value: 123, enabled: true };
    analytics.event("test-event-with-props", eventProps);
    expect(tracker.trackEvent).toHaveBeenCalledWith(
      "test-event-with-props",
      {
        props: eventProps,
      },
      { url: testUrl }
    );
  });

  it("should track custom page views", async () => {
    const { initAnalytics, analytics } = await import(
      "$lib/services/analytics.services"
    );

    const tracker = Plausible();
    initAnalytics();
    const pageToTrack = "/test-page";
    page.url = new URL(pageToTrack, "http://localhost");

    analytics.pageView();
    expect(tracker.trackPageview).toHaveBeenCalledWith({
      url: pageToTrack,
    });
  });
});
