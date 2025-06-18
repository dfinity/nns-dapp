export const slugifyTitle = (title: string) =>
  title
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Add hyphen before capital letters
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
import {
  AppPath,
  PROJECT_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";

/**
 * Transforms query parameter URLs into clean, readable URLs for analytics tracking
 */
export const transformUrlForAnalytics = (url: URL): string => {
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  switch (pathname) {
    case AppPath.Project + "/":
    case AppPath.Project: {
      const project = searchParams.get(PROJECT_PARAM);
      return project ? `/project/${project}` : pathname;
    }

    case AppPath.Neurons + "/":
    case AppPath.Neurons: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return universe ? `/neurons/${universe}` : pathname;
    }

    case AppPath.Wallet + "/":
    case AppPath.Wallet: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return universe ? `/wallet/${universe}` : pathname;
    }

    default:
      // For all other pages, return the original pathname
      return pathname;
  }
};
