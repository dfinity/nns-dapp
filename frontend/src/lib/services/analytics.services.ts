import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import Plausible from "plausible-tracker";

const domain = PLAUSIBLE_DOMAIN;

export const initAnalytics = () => {
  const tracker = Plausible({
    domain,
    hashMode: false,
    // Change to true for local development and see traffic at https://plausible.io/test.nns.ic0.app/
    trackLocalhost: false,
  });

  tracker.enableAutoPageviews();
  tracker.enableAutoOutboundTracking();
};
