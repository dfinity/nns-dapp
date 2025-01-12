import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
import {
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
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

export type TokenWithRequiredBalance = UserTokenData &
  Required<Pick<UserTokenData, "balanceInUsd">>;
/**
 * Filters and sorts user tokens based on specific criteria:
 * - Always prioritizes ICP token first
 * - Sorts remaining tokens by USD balance in descending order
 * - Sorts remaining tokens by importance
 * - Limits the number of returned tokens to maxTokensToShow
 * - When user is signed in, filters out tokens with zero balance as we show only tokens with guaranteed balance
 */
export const getTopTokens = ({
  userTokens,
  maxTokensToShow,
  isSignedIn = false,
}: {
  userTokens: UserToken[];
  maxTokensToShow: number;
  isSignedIn?: boolean;
}): TokenWithRequiredBalance[] => {
  const topTokens = userTokens
    .filter(isUserTokenData)
    .sort(compareTokens)
    .slice(0, maxTokensToShow)
    .map((token) => ({
      ...token,
      balanceInUsd: token?.balanceInUsd ?? 0,
    }));

  if (!isSignedIn) return topTokens;

  return topTokens.filter((token) => token.balanceInUsd > 0);
};
