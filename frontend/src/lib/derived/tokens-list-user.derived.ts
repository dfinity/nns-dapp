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
  type UserTokenBase,
  type UserTokenData,
} from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { isNullish, nonNullish, TokenAmountV2 } from "@dfinity/utils";
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
}): UserTokenData | undefined => {
  const balanceE8s = balances[baseTokenData.universeId.toText()]?.balanceE8s;
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
  if (isNullish(token)) {
    // TODO: GIX-2062 Add loading state
    return undefined;
  }
  const fee = TokenAmountV2.fromUlps({ amount: token.fee, token });
  if (isNullish(balanceE8s)) {
    return {
      ...baseTokenData,
      balance: new UnavailableTokenAmount(token),
      token,
      fee,
      rowHref,
    };
  }
  const balance = TokenAmountV2.fromUlps({ amount: balanceE8s, token });
  return {
    ...baseTokenData,
    token,
    fee,
    balance,
    actions:
      balance instanceof UnavailableTokenAmount
        ? []
        : [
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
  UserTokenData[]
>(
  [tokensListBaseStore, universesAccountsBalance, tokensStore, authStore],
  ([tokensList, balances, tokens, authData]) =>
    tokensList
      .map((baseTokenData) =>
        convertToUserTokenData({ baseTokenData, balances, tokens, authData })
      )
      .filter((data): data is UserTokenData => nonNullish(data))
);
