import { page } from "$app/state";
import { PLAUSIBLE_DOMAIN } from "$lib/constants/environment.constants";
import { projectSlugMapStore } from "$lib/derived/analytics.derived";
import { transformUrlForAnalytics } from "$lib/utils/analytics.utils";
import { isNullish } from "@dfinity/utils";
import Plausible from "plausible-tracker";
import { get } from "svelte/store";

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
    // Override default url for tracking that doesn't considered query params
    const url = transformUrlForAnalytics(page.url, get(projectSlugMapStore));

    try {
      tracker?.trackEvent(name, { props }, { url });
    } catch (error) {
      console.error("plausible event:", error);
    }
  },
  pageView: () => {
    const url = transformUrlForAnalytics(page.url, get(projectSlugMapStore));

    try {
      tracker?.trackPageview({ url });
    } catch (error) {
      console.error("plausible pageview:", error);
    }
  },
};
