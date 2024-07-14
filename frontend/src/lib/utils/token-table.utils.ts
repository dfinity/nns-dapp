import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { UserToken } from "$lib/types/tokens-page";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/responsive-table.utils";
import { TokenAmountV2 } from "@dfinity/utils";

const getTokenBalanceOrZero = (token: UserToken) =>
  token.balance instanceof TokenAmountV2 ? token.balance.toUlps() : 0n;

export const compareTokensIcpFirst = createDescendingComparator(
  (token: UserToken) => token.universeId.toText() === OWN_CANISTER_ID_TEXT
);

export const compareTokensWithBalanceFirst = createDescendingComparator(
  (token: UserToken) => getTokenBalanceOrZero(token) > 0n
);

// These tokens should be placed before others (but after ICP)
// because they have significance within the Internet Computer ecosystem and deserve to be highlighted.
// Where the fixed order maps to a descending order in the market cap of the underlying native tokens.
const ImportantCkTokenIds = [
  CKBTC_UNIVERSE_CANISTER_ID.toText(),
  CKETH_UNIVERSE_CANISTER_ID.toText(),
  CKUSDC_UNIVERSE_CANISTER_ID.toText(),
]
  // Reverse the list to preserve the order in the descending comparison
  .reverse();
export const compareTokensByImportance = createDescendingComparator(
  (token: UserToken) => ImportantCkTokenIds.indexOf(token.universeId.toText())
);

export const compareTokensAlphabetically = createAscendingComparator(
  ({ title }: UserToken) => title
);

export const compareTokensForTable = mergeComparators([
  compareTokensIcpFirst,
  compareTokensWithBalanceFirst,
  compareTokensByImportance,
  compareTokensAlphabetically,
]);
