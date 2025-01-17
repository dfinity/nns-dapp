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

const MAX_NUMBER_OF_ITEMS = 4;

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
 * - Limits the number of returned tokens to MAX_NUMBER_OF_ITEMS
 * - When isSigned true, filters out tokens with zero balance as we show only tokens with guaranteed balance
 */
export const getTopHeldTokens = ({
  userTokens,
  isSignedIn = false,
}: {
  userTokens: UserToken[];
  isSignedIn?: boolean;
}): UserTokenData[] => {
  const topTokens = userTokens
    .filter(isUserTokenData)
    .sort(compareTokens)
    .slice(0, MAX_NUMBER_OF_ITEMS);

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

/**
 * Filters and sorts projects based on specific criteria:
 * - Always prioritizes ICP project first
 * - Sorts remaining projects by USD stake value
 * - Sorts remaining projects by title alphabetically
 * - Limits the number of returned projects to MAX_NUMBER_OF_ITEMS
 * - When isSignedIn true, filters out projects with zero stake as we show only projects with guaranteed stake
 */
export const getTopStakedTokens = ({
  projects,
  isSignedIn = false,
}: {
  projects: TableProject[];
  isSignedIn?: boolean;
}): TableProject[] => {
  const topProjects = [...projects]
    .sort(compareProjects)
    .slice(0, MAX_NUMBER_OF_ITEMS);

  if (!isSignedIn) return topProjects;

  return topProjects.filter((project) => project?.stakeInUsd ?? 0 > 0);
};

/**
 * Determines whether to show an info row in a card based on specific display rules.
 * Rules for showing the info row:
 * 1. When the other card has more tokens than the current card
 * 2. When the other card is empty (has 0 tokens)
 * 3. When both cards have fewer than 3 tokens (for visual balance)
 */
export const shouldShowInfoRow = ({
  currentCardTokens,
  otherCardTokens,
}: {
  currentCardTokens: number;
  otherCardTokens: number;
}) => {
  return (
    otherCardTokens - currentCardTokens > 0 ||
    otherCardTokens === 0 ||
    (currentCardTokens < 3 && otherCardTokens < 3)
  );
};
