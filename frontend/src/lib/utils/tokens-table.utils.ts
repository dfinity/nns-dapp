import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { IMPORTANT_CK_TOKEN_IDS } from "$lib/constants/tokens.constants";
import type { UserToken } from "$lib/types/tokens-page";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import { isUserTokenFailed } from "$lib/utils/user-token.utils";
import { TokenAmountV2 } from "@dfinity/utils";

const getTokenBalanceOrZero = (token: UserToken) =>
  token.balance instanceof TokenAmountV2 ? token.balance.toUlps() : 0n;

export const compareTokensIcpFirst = createDescendingComparator(
  (token: UserToken) => token.universeId.toText() === OWN_CANISTER_ID_TEXT
);

export const compareFailedTokensLast = createAscendingComparator(
  (token: UserToken) => isUserTokenFailed(token)
);

export const compareTokensWithBalanceOrImportedFirst = ({
  importedTokenIds,
}: {
  importedTokenIds: Set<string>;
}) =>
  createDescendingComparator(
    (token: UserToken) =>
      getTokenBalanceOrZero(token) > 0n ||
      importedTokenIds.has(token.universeId.toText())
  );

// These tokens should be placed before others (but after ICP)
// because they have significance within the Internet Computer ecosystem and deserve to be highlighted.
// Where the fixed order maps to a descending order in the market cap of the underlying native tokens.
const ImportantCkTokenIds = IMPORTANT_CK_TOKEN_IDS.map((token) =>
  token.toText()
)
  // To place other tokens (which get an index of -1) at the bottom.
  .reverse();
export const compareTokensByImportance = createDescendingComparator(
  (token: UserToken) => ImportantCkTokenIds.indexOf(token.universeId.toText())
);

export const compareTokensAlphabetically = createAscendingComparator(
  ({ title }: UserToken) => title.toLowerCase()
);

export const compareTokensForTokensTable = ({
  importedTokenIds,
}: {
  importedTokenIds: Set<string>;
}) =>
  mergeComparators([
    compareTokensIcpFirst,
    compareTokensWithBalanceOrImportedFirst({ importedTokenIds }),
    compareFailedTokensLast,
    compareTokensByImportance,
    compareTokensAlphabetically,
  ]);
