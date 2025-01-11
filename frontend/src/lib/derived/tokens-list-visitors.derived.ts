import { tokensListBaseStore } from "$lib/derived/tokens-list-base.derived";
import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  UserTokenAction,
  type UserToken,
  type UserTokenBase,
} from "$lib/types/tokens-page";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { TokenAmountV2, isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

const convertToUserToken = ({
  tokenBaseData,
  tokensByUniverse,
}: {
  tokenBaseData: UserTokenBase;
  tokensByUniverse: Record<string, IcrcTokenMetadata>;
}): UserToken => {
  const token = tokensByUniverse[tokenBaseData.universeId.toText()];
  const rowHref = isUniverseNns(tokenBaseData.universeId)
    ? buildAccountsUrl({ universe: tokenBaseData.universeId.toText() })
    : buildWalletUrl({
        universe: tokenBaseData.universeId.toText(),
      });
  if (isNullish(token)) {
    return {
      ...tokenBaseData,
      balance: "loading",
      actions: [],
      rowHref,
      domKey: rowHref,
    };
  }
  return {
    ...tokenBaseData,
    balance: new UnavailableTokenAmount(token),
    token,
    fee: TokenAmountV2.fromUlps({ amount: token.fee, token }),
    actions: [UserTokenAction.GoToDetail],
    rowHref,
    domKey: rowHref,
  };
};

export const tokensListVisitorsStore = derived<
  [Readable<UserTokenBase[]>, Readable<Record<string, IcrcTokenMetadata>>],
  UserToken[]
>(
  [tokensListBaseStore, tokensByUniverseIdStore],
  ([tokensData, tokensByUniverse]) =>
    tokensData.map((tokenBaseData) =>
      convertToUserToken({ tokensByUniverse, tokenBaseData })
    )
);
