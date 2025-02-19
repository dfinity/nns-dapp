import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import Plausible from "plausible-tracker";

type Cleanup = () => void;

const domain = PLAUSIBLE_DOMAIN;

export const initAnalytics = (): Cleanup[] => {
  const cleanUpFunctions: Cleanup[] = [];

  const tracker = Plausible({
    domain,
    hashMode: false,
    // Change to true for local development and see traffic at https://plausible.io/test.nns.ic0.app/
    trackLocalhost: false,
  });

  cleanUpFunctions.push(tracker.enableAutoPageviews());
  cleanUpFunctions.push(tracker.enableAutoOutboundTracking());

  return cleanUpFunctions;
};
