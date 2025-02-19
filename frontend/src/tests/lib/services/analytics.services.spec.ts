import { initAnalytics } from "$lib/services/analytics.services";
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
  const plausibleDomain = "test-domain";

  it("should not do anything if domain is not set", async () => {
    expect(Plausible).toHaveBeenCalledTimes(0);

    initAnalytics(undefined);

    expect(Plausible).toHaveBeenCalledTimes(0);
  });

  it("should initialize Plausible with correct configuration", () => {
    expect(Plausible).toHaveBeenCalledTimes(0);

    initAnalytics(plausibleDomain);

    expect(Plausible).toHaveBeenCalledTimes(1);
    expect(Plausible).toHaveBeenCalledWith({
      domain: plausibleDomain,
      hashMode: false,
      trackLocalhost: false,
    });
  });

  it("should enable auto page views and outbound tracking", () => {
    const tracker = Plausible();

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(0);
    expect(tracker.enableAutoOutboundTracking).toHaveBeenCalledTimes(0);

    initAnalytics(plausibleDomain);

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(1);
    expect(tracker.enableAutoOutboundTracking).toHaveBeenCalledTimes(1);
  });
});
