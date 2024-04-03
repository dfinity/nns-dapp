import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  icpAccountsStore,
  type IcpAccountsStore,
} from "$lib/derived/icp-accounts.derived";
import { i18n } from "$lib/stores/i18n";
import type { Account, AccountType } from "$lib/types/account";
import { UserTokenAction, type UserToken } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

const convertAccountToUserTokenData = ({
  nnsUniverse,
  i18nObj: i18nObj,
  account,
}: {
  nnsUniverse: Universe;
  i18nObj: I18n;
  account?: Account;
}): UserToken => {
  const rowHref = buildWalletUrl({
    universe: nnsUniverse.canisterId.toString(),
    account: account?.type !== "main" ? account?.identifier : undefined,
  });
  if (isNullish(account)) {
    return {
      universeId: Principal.fromText(nnsUniverse.canisterId),
      title: i18nObj.accounts.main,
      balance: "loading",
      logo: nnsUniverse.logo,
      actions: [],
      rowHref,
    };
  }

  const subtitleMap: Record<AccountType, string | undefined> = {
    main: undefined,
    subAccount: undefined,
    hardwareWallet: i18nObj.accounts.hardwareWallet,
  };

  const title: string =
    account.type === "main" ? i18nObj.accounts.main : account.name ?? "";

  return {
    universeId: Principal.fromText(nnsUniverse.canisterId),
    title,
    subtitle: subtitleMap[account.type],
    balance: TokenAmountV2.fromUlps({
      amount: account.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    logo: nnsUniverse.logo,
    token: NNS_TOKEN_DATA,
    fee: TokenAmountV2.fromUlps({
      amount: NNS_TOKEN_DATA.fee,
      token: NNS_TOKEN_DATA,
    }),
    rowHref,
    accountIdentifier: account.identifier,
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  };
};

export const icpTokensListUser = derived<
  [Readable<Universe>, IcpAccountsStore, Readable<I18n>],
  UserToken[]
>(
  [nnsUniverseStore, icpAccountsStore, i18n],
  ([nnsUniverse, icpAccounts, i18nObj]) => [
    convertAccountToUserTokenData({
      nnsUniverse,
      i18nObj,
      account: icpAccounts.main,
    }),
    ...(icpAccounts.subAccounts ?? []).map((account) =>
      convertAccountToUserTokenData({ nnsUniverse, i18nObj, account })
    ),
    ...(icpAccounts.hardwareWallets ?? []).map((account) =>
      convertAccountToUserTokenData({ nnsUniverse, i18nObj, account })
    ),
  ]
);
