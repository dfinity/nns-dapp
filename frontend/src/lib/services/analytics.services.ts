import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import { isNullish } from "@dfinity/utils";
import Plausible from "plausible-tracker";

const domain = PLAUSIBLE_DOMAIN;

let tracker: ReturnType<typeof Plausible> | undefined;

export const initAnalytics = () => {
  if (isNullish(domain)) return;

  tracker = Plausible({
    domain,
    hashMode: false,
    // Change to true for local development and see traffic at https://plausible.io/test.nns.ic0.app/
    trackLocalhost: false,
  });
};

export const analytics = {
  event: (name: string, props?: Record<string, string | number | boolean>) => {
    try {
      tracker?.trackEvent(name, { props });
    } catch (error) {
      console.error("plausible event:", error);
    }
  },
  pageView: (url: string) => {
    try {
      tracker?.trackPageview({ url });
    } catch (error) {
      console.error("plausible pageview:", error);
    }
  },
};
