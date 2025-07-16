import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { IMPORTANT_CK_TOKEN_IDS } from "$lib/constants/tokens.constants";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import type { UserToken } from "$lib/types/tokens-page";
import { isImportedToken } from "$lib/utils/imported-tokens.utils";
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

export const compareTokensIsImported = ({
  importedTokenIds,
}: {
  importedTokenIds: Set<string>;
}) =>
  createDescendingComparator((token: UserToken) =>
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

export const compareTokensByUsdBalance = createDescendingComparator(
  (token: UserToken) =>
    "balanceInUsd" in token ? (token.balanceInUsd ?? 0) : 0
);

export const compareTokenHasBalance = createDescendingComparator(
  (token: UserToken) =>
    token.balance instanceof TokenAmountV2 && token.balance.toUlps() > 0n
);

export const compareTokensByProject = mergeComparators([
  compareTokensIcpFirst,
  compareTokensAlphabetically,
]);

// This is used when clicking the "Balance" header, but in addition to sorting
// by balance, it has a number of tie breakers.
// Note that it tries to sort by USD balance but also sorts tokens with balance
// above tokens without balance if there is no exchange rate for that token.
export const compareTokensByBalance = ({
  importedTokenIds,
}: {
  importedTokenIds: Set<string>;
}) =>
  mergeComparators([
    compareTokensIcpFirst,
    compareTokensByUsdBalance,
    compareTokenHasBalance,
    compareTokensByImportance,
    compareTokensIsImported({ importedTokenIds }),
    compareFailedTokensLast,
  ]);

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

const importantTokensText = IMPORTANT_CK_TOKEN_IDS.map((token) =>
  token.toText()
);
const isIcpToken = (token: UserToken) =>
  token.universeId.toText() === OWN_CANISTER_ID_TEXT;
const isCkToken = (token: UserToken) =>
  importantTokensText.includes(token.universeId.toText());

export const filterTokensByType = (
  tokens: UserToken[],
  type: "icp" | "ck" | "sns" | "imported",
  importedTokens: ImportedTokenData[] = []
) => {
  if (type === "icp") return tokens.filter(isIcpToken);
  if (type === "ck") return tokens.filter(isCkToken);
  if (type === "imported")
    return tokens.filter((t) =>
      isImportedToken({ ledgerCanisterId: t.ledgerCanisterId, importedTokens })
    );

  if (type === "sns")
    return tokens.filter(
      (t) =>
        !isIcpToken(t) &&
        !isCkToken(t) &&
        !isImportedToken({
          ledgerCanisterId: t.ledgerCanisterId,
          importedTokens,
        })
    );
  return [];
};
