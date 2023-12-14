import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  authStore,
  type AuthStore,
  type AuthStoreData,
} from "$lib/stores/auth.store";
import {
  tokensStore,
  type TokensStore,
  type TokensStoreData,
} from "$lib/stores/tokens.store";
import {
  UserTokenAction,
  type UserToken,
  type UserTokenBase,
} from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { tokensListBaseStore } from "./tokens-list-base.derived";
import {
  universesAccountsBalance,
  type UniversesAccountsBalanceReadableStore,
} from "./universes-accounts-balance.derived";

const convertToUserTokenData = ({
  balances,
  tokens,
  baseTokenData,
  authData,
}: {
  balances: UniversesAccountsBalanceReadableStore;
  tokens: TokensStoreData;
  baseTokenData: UserTokenBase;
  authData: AuthStoreData;
}): UserToken => {
  const balanceUlps = balances[baseTokenData.universeId.toText()]?.balanceUlps;
  const token = tokens[baseTokenData.universeId.toText()]?.token;
  const rowHref = isNullish(authData.identity)
    ? undefined
    : isUniverseNns(baseTokenData.universeId)
    ? buildAccountsUrl({ universe: baseTokenData.universeId.toText() })
    : buildWalletUrl({
        universe: baseTokenData.universeId.toText(),
        account: encodeIcrcAccount({
          owner: authData.identity.getPrincipal(),
        }),
      });
  if (isNullish(token) || isNullish(balanceUlps)) {
    return {
      ...baseTokenData,
      balance: "loading",
      actions: [],
    };
  }
  const fee = TokenAmountV2.fromUlps({ amount: token.fee, token });
  const balance = TokenAmountV2.fromUlps({ amount: balanceUlps, token });
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
    rowHref,
  };
};

export const tokensListUserStore = derived<
  [
    Readable<UserTokenBase[]>,
    Readable<UniversesAccountsBalanceReadableStore>,
    TokensStore,
    AuthStore,
  ],
  UserToken[]
>(
  [tokensListBaseStore, universesAccountsBalance, tokensStore, authStore],
  ([tokensList, balances, tokens, authData]) =>
    tokensList.map((baseTokenData) =>
      convertToUserTokenData({ baseTokenData, balances, tokens, authData })
    )
);
