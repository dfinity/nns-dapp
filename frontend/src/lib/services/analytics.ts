import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import Plausible from "plausible-tracker";

const domain = PLAUSIBLE_DOMAIN;
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
