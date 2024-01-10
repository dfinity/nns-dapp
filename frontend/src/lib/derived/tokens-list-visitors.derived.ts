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
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { tokensListBaseStore } from "./tokens-list-base.derived";

const convertToUserToken = ({
  tokenBaseData,
  tokensStore,
}: {
  tokenBaseData: UserTokenBase;
  tokensStore: TokensStoreData;
}): UserToken => {
  const token = tokensStore[tokenBaseData.universeId.toText()]?.token;
  if (isNullish(token)) {
    return {
      ...tokenBaseData,
      balance: "loading",
      actions: [],
    };
  }
  return {
    ...tokenBaseData,
    balance: new UnavailableTokenAmount(token),
    token,
    fee: TokenAmountV2.fromUlps({ amount: token.fee, token }),
    actions: [UserTokenAction.GoToDetail],
  };
};

export const tokensListVisitorsStore = derived<
  [Readable<UserTokenBase[]>, TokensStore],
  UserToken[]
>([tokensListBaseStore, tokensStore], ([tokensData, tokensStore]) =>
  tokensData.map((tokenBaseData) =>
    convertToUserToken({ tokensStore, tokenBaseData })
  )
);
