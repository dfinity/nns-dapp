import {
  AppPath,
  PROJECT_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";

export const slugifyTitle = (title: string) =>
  title
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Add hyphen before capital letters
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

/**
 * Transforms query parameter URLs into clean, readable URLs for analytics tracking
 */
export const transformUrlForAnalytics = (
  url: URL,
  projectsToSlugMap: Map<string, string>
): string => {
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  switch (pathname) {
    case AppPath.Project + "/":
    case AppPath.Project: {
      const project = searchParams.get(PROJECT_PARAM);
      return project
        ? `${AppPath.Project}/${projectsToSlugMap.get(project) ?? project}`
        : pathname;
    }

    case AppPath.Neurons + "/":
    case AppPath.Neurons: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return universe
        ? `${AppPath.Neurons}/${projectsToSlugMap.get(universe) ?? universe}`
        : pathname;
    }

    case AppPath.Wallet + "/":
    case AppPath.Wallet: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return universe
        ? `${AppPath.Wallet}/${projectsToSlugMap.get(universe) ?? universe}`
        : pathname;
    }

    default:
      return pathname;
  }
};
