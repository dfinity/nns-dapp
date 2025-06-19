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

const buildUrl = (
  url: string,
  projectsToSlugMap: Map<string, string>,
  parameter: string | null
) =>
  parameter
    ? `${url}/${projectsToSlugMap.get(parameter) ?? parameter}`
    : `${url}/`;

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
      return buildUrl(AppPath.Project, projectsToSlugMap, project);
    }

    case AppPath.Neuron + "/":
    case AppPath.Neuron: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return buildUrl(AppPath.Neuron, projectsToSlugMap, universe);
    }

    case AppPath.Neurons + "/":
    case AppPath.Neurons: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return buildUrl(AppPath.Neurons, projectsToSlugMap, universe);
    }

    case AppPath.Wallet + "/":
    case AppPath.Wallet: {
      const universe = searchParams.get(UNIVERSE_PARAM);
      return buildUrl(AppPath.Wallet, projectsToSlugMap, universe);
    }

    default:
      return pathname;
  }
};
