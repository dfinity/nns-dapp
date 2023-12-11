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
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { tokensListBaseStore } from "./tokens-list-base.derived";
import {
  universesAccountsBalance,
  type UniversesAccountsBalanceReadableStore,
} from "./universes-accounts-balance.derived";

const addBalance =
  ({
    balances,
    tokens,
  }: {
    balances: UniversesAccountsBalanceReadableStore;
    tokens: TokensStoreData;
  }) =>
  (userTokenData: UserTokenData): UserTokenData => {
    const balanceE8s = balances[userTokenData.universeId.toText()]?.balanceE8s;
    const token = tokens[userTokenData.universeId.toText()]?.token;
    if (isNullish(token) || isNullish(balanceE8s)) {
      return userTokenData;
    }
    const balance = TokenAmountV2.fromUlps({ amount: balanceE8s, token });
    return {
      ...userTokenData,
      balance,
    };
  };

const addActions = (userTokenData: UserTokenData): UserTokenData => ({
  ...userTokenData,
  actions:
    userTokenData.balance instanceof UnavailableTokenAmount
      ? []
      : [
          ...(userTokenData.universeId.toText() === OWN_CANISTER_ID_TEXT
            ? [UserTokenAction.GoToDetail]
            : [UserTokenAction.Receive, UserTokenAction.Send]),
        ],
});

const addHref = ({
  userTokenData,
  authData,
}: {
  userTokenData: UserTokenData;
  authData: AuthStoreData;
}): UserTokenData => ({
  ...userTokenData,
  rowHref: isNullish(authData.identity)
    ? undefined
    : isUniverseNns(userTokenData.universeId)
    ? buildAccountsUrl({ universe: userTokenData.universeId.toText() })
    : buildWalletUrl({
        universe: userTokenData.universeId.toText(),
        account: encodeIcrcAccount({
          owner: authData.identity.getPrincipal(),
        }),
      }),
});

export const tokensListUserStore = derived<
  [
    Readable<UserTokenData[]>,
    Readable<UniversesAccountsBalanceReadableStore>,
    TokensStore,
    AuthStore,
  ],
  UserTokenData[]
>(
  [tokensListBaseStore, universesAccountsBalance, tokensStore, authStore],
  ([tokensList, balances, tokens, authData]) =>
    tokensList
      .map(addBalance({ balances, tokens }))
      .map(addActions)
      .map((userTokenData) => addHref({ userTokenData, authData }))
);
