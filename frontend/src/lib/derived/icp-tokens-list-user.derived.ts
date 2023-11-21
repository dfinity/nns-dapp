import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { i18n } from "$lib/stores/i18n";
import {
  icpAccountsStore,
  type IcpAccountsStore,
} from "$lib/stores/icp-accounts.store";
import type { Account, AccountType } from "$lib/types/account";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import type { Universe } from "$lib/types/universe";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish, TokenAmount } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { nnsUniverseStore } from "./nns-universe.derived";

const convertAccountToUserTokenData =
  ({ nnsUniverse, i18nKeys }: { nnsUniverse: Universe; i18nKeys: I18n }) =>
  (account?: Account): UserTokenData => {
    const subtitleMap: Record<AccountType, string | undefined> = {
      main: undefined,
      subAccount: i18nKeys.accounts.subAccount,
      hardwareWallet: i18nKeys.accounts.hardwareWallet,
      // This is not used in the UI, but it's here for completeness
      withdrawalAccount: i18nKeys.accounts.withdrawalAccount,
    };
    const title: string = isNullish(account)
      ? i18nKeys.core.ic
      : account.type === "main"
      ? i18nKeys.accounts.main
      : account.name ?? "";
    return {
      universeId: Principal.fromText(nnsUniverse.canisterId),
      title,
      subtitle: nonNullish(account) ? subtitleMap[account.type] : undefined,
      // TODO: Add loading balance state
      balance: nonNullish(account)
        ? TokenAmount.fromE8s({
            amount: account.balanceE8s,
            token: NNS_TOKEN_DATA,
          })
        : new UnavailableTokenAmount(NNS_TOKEN_DATA),
      logo: nnsUniverse.logo,
      actions: nonNullish(account)
        ? [UserTokenAction.Receive, UserTokenAction.Send]
        : [],
    };
  };

export const icpTokensListUser = derived<
  [Readable<Universe>, IcpAccountsStore, Readable<I18n>],
  UserTokenData[]
>(
  [nnsUniverseStore, icpAccountsStore, i18n],
  ([nnsUniverse, icpAccounts, i18nKeys]) => [
    convertAccountToUserTokenData({ nnsUniverse, i18nKeys })(icpAccounts.main),
    ...(icpAccounts.subAccounts ?? []).map(
      convertAccountToUserTokenData({ nnsUniverse, i18nKeys })
    ),
    ...(icpAccounts.hardwareWallets ?? []).map(
      convertAccountToUserTokenData({ nnsUniverse, i18nKeys })
    ),
  ]
);
