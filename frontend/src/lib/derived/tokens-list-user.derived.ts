import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  UserTokenAction,
  type UserToken,
  type UserTokenBase,
} from "$lib/types/tokens-page";
import { sumAccounts } from "$lib/utils/accounts.utils";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { TokenAmountV2, isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import type { UniversesAccounts } from "./accounts-list.derived";
import { tokensListBaseStore } from "./tokens-list-base.derived";
import { tokensByUniverseIdStore } from "./tokens.derived";
import { universesAccountsStore } from "./universes-accounts.derived";

const convertToUserTokenData = ({
  accounts,
  tokensByUniverse,
  baseTokenData,
}: {
  accounts: UniversesAccounts;
  tokensByUniverse: Record<string, IcrcTokenMetadata>;
  baseTokenData: UserTokenBase;
}): UserToken => {
  const token = tokensByUniverse[baseTokenData.universeId.toText()];
  const rowHref = isUniverseNns(baseTokenData.universeId)
    ? buildAccountsUrl({ universe: baseTokenData.universeId.toText() })
    : buildWalletUrl({
        universe: baseTokenData.universeId.toText(),
      });
  const accountsList = accounts[baseTokenData.universeId.toText()];
  const mainAccount = accountsList?.find(({ type }) => type === "main");
  if (isNullish(token) || isNullish(accountsList) || isNullish(mainAccount)) {
    return {
      ...baseTokenData,
      balance: "loading",
      actions: [],
      rowHref,
      domKey: rowHref,
    };
  }
  const fee = TokenAmountV2.fromUlps({ amount: token.fee, token });
  // For ICP we show the sum of all ICP accounts.
  // For other tokens we show the main account balance because subaccounts are not yet supported.
  const balance = TokenAmountV2.fromUlps({
    amount: isUniverseNns(baseTokenData.universeId)
      ? sumAccounts(accountsList)
      : mainAccount.balanceUlps,
    token,
  });
  // For ICP, the row represents all the ICP accounts. Therefore, we don't want to set the accountIdentifier.
  const accountIdentifier = isUniverseNns(baseTokenData.universeId)
    ? undefined
    : mainAccount.identifier;
  return {
    ...baseTokenData,
    token,
    fee,
    balance,
    actions: [
      ...(baseTokenData.universeId.toText() === OWN_CANISTER_ID_TEXT
        ? [UserTokenAction.GoToDetail]
        : [UserTokenAction.Receive, UserTokenAction.Send]),
    ],
    accountIdentifier,
    rowHref,
    domKey: rowHref,
  };
};

export const tokensListUserStore = derived<
  [
    Readable<UserTokenBase[]>,
    Readable<UniversesAccounts>,
    Readable<Record<string, IcrcTokenMetadata>>,
  ],
  UserToken[]
>(
  [tokensListBaseStore, universesAccountsStore, tokensByUniverseIdStore],
  ([tokensList, accounts, tokensByUniverse]) =>
    tokensList.map((baseTokenData) =>
      convertToUserTokenData({
        baseTokenData,
        accounts,
        tokensByUniverse,
      })
    )
);
