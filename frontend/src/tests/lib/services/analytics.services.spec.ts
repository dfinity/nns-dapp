import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import { initAnalytics } from "$lib/services/analytics.services";
import Plausible from "plausible-tracker";
import { describe, expect, it, vi } from "vitest";

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
  it("should initialize Plausible with correct configuration", () => {
    initAnalytics();

    expect(Plausible).toHaveBeenCalledWith({
      domain: PLAUSIBLE_DOMAIN,
      hashMode: false,
      trackLocalhost: false,
    });
  });

  it("should enable auto page views and outbound tracking", () => {
    const tracker = Plausible();

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(0);
    expect(tracker.enableAutoOutboundTracking).toHaveBeenCalledTimes(0);

    initAnalytics();

    expect(tracker.enableAutoPageviews).toHaveBeenCalledTimes(1);
    expect(tracker.enableAutoOutboundTracking).toHaveBeenCalledTimes(1);
  });
});
