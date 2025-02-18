import Plausible from "plausible-tracker";

const domain = "nns.ic0.app";
let tracker: ReturnType<typeof Plausible> | null = null;

export const initAnalytics = () => {
  tracker = Plausible({
    domain,
    hashMode: false,
    // It can be changed to true to see the traffic reaching https://plausible.io/nns.ic0.app
    trackLocalhost: false,
  });

  tracker.enableAutoPageviews();
  tracker.enableAutoOutboundTracking();
};
