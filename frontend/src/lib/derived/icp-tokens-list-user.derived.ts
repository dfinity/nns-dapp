import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  icpAccountsStore,
  type IcpAccountsStore,
} from "$lib/derived/icp-accounts.derived";
import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { i18n } from "$lib/stores/i18n";
import type { Account, AccountType } from "$lib/types/account";
import { UserTokenAction, type UserToken } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
import { sortUserTokens } from "$lib/utils/token.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

const convertAccountToUserTokenData = ({
  nnsUniverse,
  i18nObj: i18nObj,
  account,
  icpPrice,
}: {
  nnsUniverse: Universe;
  i18nObj: I18n;
  account?: Account;
  icpPrice?: number;
}): UserToken => {
  const rowHref = buildWalletUrl({
    universe: nnsUniverse.canisterId.toString(),
    account: account?.type !== "main" ? account?.identifier : undefined,
  });
  if (isNullish(account)) {
    return {
      universeId: Principal.fromText(nnsUniverse.canisterId),
      ledgerCanisterId: LEDGER_CANISTER_ID,
      title: i18nObj.accounts.main,
      balance: "loading",
      logo: nnsUniverse.logo,
      actions: [],
      rowHref,
      domKey: rowHref,
    };
  }

  const subtitleMap: Record<AccountType, string | undefined> = {
    main: undefined,
    subAccount: undefined,
    hardwareWallet: i18nObj.accounts.hardwareWallet,
  };

  const title: string =
    account.type === "main" ? i18nObj.accounts.main : (account.name ?? "");

  return {
    universeId: Principal.fromText(nnsUniverse.canisterId),
    ledgerCanisterId: LEDGER_CANISTER_ID,
    title,
    subtitle: subtitleMap[account.type],
    balance: TokenAmountV2.fromUlps({
      amount: account.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    balanceInUsd:
      icpPrice && (Number(account.balanceUlps) / E8S_PER_ICP) * icpPrice,
    logo: nnsUniverse.logo,
    token: NNS_TOKEN_DATA,
    fee: TokenAmountV2.fromUlps({
      amount: NNS_TOKEN_DATA.fee,
      token: NNS_TOKEN_DATA,
    }),
    rowHref,
    domKey: rowHref,
    accountIdentifier: account.identifier,
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
};

export const icpTokensListUser = derived<
  [
    Readable<Universe>,
    IcpAccountsStore,
    Readable<I18n>,
    Readable<Record<string, number> | undefined>,
  ],
  UserToken[]
>(
  [nnsUniverseStore, icpAccountsStore, i18n, icpSwapUsdPricesStore],
  ([nnsUniverse, icpAccounts, i18nObj, icpSwapUsdPrices]) => {
    const icpPrice = icpSwapUsdPrices?.[LEDGER_CANISTER_ID.toText()];
    return [
      convertAccountToUserTokenData({
        nnsUniverse,
        i18nObj,
        account: icpAccounts.main,
        icpPrice,
      }),
      ...sortUserTokens([
        ...(icpAccounts.subAccounts ?? []).map((account) =>
          convertAccountToUserTokenData({
            nnsUniverse,
            i18nObj,
            account,
            icpPrice,
          })
        ),
        ...(icpAccounts.hardwareWallets ?? []).map((account) =>
          convertAccountToUserTokenData({
            nnsUniverse,
            i18nObj,
            account,
            icpPrice,
          })
        ),
      ]),
    ];
  }
);
