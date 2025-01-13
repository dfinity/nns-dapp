import type { TableProject } from "$lib/types/staking";
import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
import {
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import {
  compareByProjectTitle,
  compareIcpFirst,
} from "$lib/utils/staking.utils";
import {
  compareTokensByImportance,
  compareTokensIcpFirst,
} from "$lib/utils/tokens-table.utils";
import { isUserTokenData } from "$lib/utils/user-token.utils";

const compareTokensByUsdBalance = createDescendingComparator(
  (token: UserTokenData) => token?.balanceInUsd ?? 0 > 0
);

const compareTokens = mergeComparators([
  compareTokensIcpFirst,
  compareTokensByUsdBalance,
  compareTokensByImportance,
]);

/**
 * Filters and sorts user tokens based on specific criteria:
 * - Always prioritizes ICP token first
 * - Sorts remaining tokens by USD balance
 * - Sorts remaining tokens by importance
 * - Limits the number of returned tokens to maxTokensToShow
 * - When isSigned true, filters out tokens with zero balance as we show only tokens with guaranteed balance
 */
export const getTopTokens = ({
  userTokens,
  maxResults = 4,
  isSignedIn = false,
}: {
  userTokens: UserToken[];
  maxResults?: number;
  isSignedIn?: boolean;
}): UserTokenData[] => {
  const topTokens = userTokens
    .filter(isUserTokenData)
    .sort(compareTokens)
    .slice(0, maxResults);

  if (!isSignedIn) return topTokens;

  return topTokens.filter((token) => token?.balanceInUsd ?? 0 > 0);
};

const compareProjectsByUsdBalance = createDescendingComparator(
  (project: TableProject) => project?.stakeInUsd ?? 0 > 0
);

const compareProjects = mergeComparators([
  compareIcpFirst,
  compareProjectsByUsdBalance,
  compareByProjectTitle,
]);

export const getTopProjects = ({
  projects,
  maxResults = 4,
  isSignedIn = false,
}: {
  projects: TableProject[];
  maxResults?: number;
  isSignedIn?: boolean;
}): TableProject[] => {
  const topProjects = projects.sort(compareProjects).slice(0, maxResults);

  if (!isSignedIn) return topProjects;

  return topProjects.filter((project) => project?.stakeInUsd ?? 0 > 0);
};
