import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  tokensStore,
  type TokensStore,
  type TokensStoreData,
} from "$lib/stores/tokens.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { isNullish, TokenAmount } from "@dfinity/utils";
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
    const balance = TokenAmount.fromE8s({ amount: balanceE8s, token });
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

export const tokensListUserStore = derived<
  [
    Readable<UserTokenData[]>,
    Readable<UniversesAccountsBalanceReadableStore>,
    TokensStore,
  ],
  UserTokenData[]
>(
  [tokensListBaseStore, universesAccountsBalance, tokensStore],
  ([tokensList, balances, tokens]) =>
    tokensList.map(addBalance({ balances, tokens })).map(addActions)
);
