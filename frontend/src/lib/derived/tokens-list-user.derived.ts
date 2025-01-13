import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import {
  icpSwapUsdPricesStore,
  type IcpSwapUsdPricesStore,
  type IcpSwapUsdPricesStoreData,
} from "$lib/derived/icp-swap.derived";
import { failedExistentImportedTokenLedgerIdsStore } from "$lib/derived/imported-tokens.derived";
import { tokensListBaseStore } from "$lib/derived/tokens-list-base.derived";
import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import {
  UserTokenAction,
  type UserToken,
  type UserTokenBase,
} from "$lib/types/tokens-page";
import { sumAccounts } from "$lib/utils/accounts.utils";
import { buildAccountsUrl, buildWalletUrl } from "$lib/utils/navigation.utils";
import { isUniverseNns } from "$lib/utils/universe.utils";
import { toUserTokenFailed } from "$lib/utils/user-token.utils";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

const getUsdValue = ({
  balance,
  ledgerCanisterId,
  icpSwapUsdPrices,
}: {
  balance: TokenAmountV2;
  ledgerCanisterId: string;
  icpSwapUsdPrices: IcpSwapUsdPricesStoreData;
}): number | undefined => {
  const balanceE8s = Number(balance.toE8s());
  if (balanceE8s === 0) {
    return 0;
  }
  if (isNullish(icpSwapUsdPrices) || icpSwapUsdPrices === "error") {
    return undefined;
  }
  const tokenUsdPrice = icpSwapUsdPrices[ledgerCanisterId];
  if (isNullish(tokenUsdPrice)) {
    return undefined;
  }
  return (balanceE8s * tokenUsdPrice) / 100_000_000;
};

const convertToUserTokenData = ({
  accounts,
  tokensByUniverse,
  baseTokenData,
  icpSwapUsdPrices,
}: {
  accounts: UniversesAccounts;
  tokensByUniverse: Record<string, IcrcTokenMetadata>;
  baseTokenData: UserTokenBase;
  icpSwapUsdPrices: IcpSwapUsdPricesStoreData;
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
    balanceInUsd: getUsdValue({
      balance,
      ledgerCanisterId: baseTokenData.ledgerCanisterId.toText(),
      icpSwapUsdPrices,
    }),
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
    Readable<Array<string>>,
    IcpSwapUsdPricesStore,
  ],
  UserToken[]
>(
  [
    tokensListBaseStore,
    universesAccountsStore,
    tokensByUniverseIdStore,
    failedExistentImportedTokenLedgerIdsStore,
    icpSwapUsdPricesStore,
  ],
  ([
    tokensList,
    accounts,
    tokensByUniverse,
    failedImportedTokenLedgerIds,
    icpSwapUsdPrices,
  ]) => [
    ...tokensList.map((baseTokenData) =>
      convertToUserTokenData({
        baseTokenData,
        accounts,
        tokensByUniverse,
        icpSwapUsdPrices,
      })
    ),
    ...failedImportedTokenLedgerIds.map(toUserTokenFailed),
  ]
);
