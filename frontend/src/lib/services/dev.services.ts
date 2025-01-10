import { getBTCAddress } from "$lib/api/ckbtc-minter.api";
import {
  acquireICPTs,
  acquireIcrcTokens,
  receiveMockBtc,
} from "$lib/api/dev.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { syncAccounts } from "$lib/services/icp-accounts.services";
import { loadAccounts } from "$lib/services/icrc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { numberToUlps } from "$lib/utils/token.utils";
import type { Principal } from "@dfinity/principal";
import { ICPToken, nonNullish, type Token } from "@dfinity/utils";
import { get } from "svelte/store";

const getMainAccount = async (): Promise<Account> => {
  const { main }: IcpAccountsStoreData = get(icpAccountsStore);
  if (nonNullish(main)) {
    return main;
  }
  return new Promise((resolve) => {
    const unsubscribe = icpAccountsStore.subscribe(
      ({ main }: IcpAccountsStoreData) => {
        if (nonNullish(main)) {
          unsubscribe();
          resolve(main);
        }
      }
    );
  });
};

export const getICPs = async (icps: number) => {
  const main = await getMainAccount();

  if (!main) {
    throw new Error("No account found to get ICPs");
  }

  await acquireICPTs({
    e8s: numberToUlps({ amount: icps, token: ICPToken }),
    accountIdentifier: main.identifier,
  });

  await syncAccounts();
};

// Not clear whether BTC should use the same token as ckBTC, that's why we have a separate token here.
// Not exported to not be used outside the dev services.
const BTC_TOKEN: Token = {
  decimals: 8,
  name: "Bitcoin",
  symbol: "BTC",
};

export const getBTC = async ({ amount }: { amount: number }) => {
  const identity = await getAuthenticatedIdentity();
  const btcAddress = await getBTCAddress({
    canisterId: CKBTC_MINTER_CANISTER_ID,
    identity,
  });
  await receiveMockBtc({
    btcAddress,
    amountE8s: numberToUlps({ amount, token: BTC_TOKEN }),
  });
};

export const getIcrcTokens = async ({
  tokens,
  ledgerCanisterId,
  token,
}: {
  tokens: number;
  ledgerCanisterId: Principal;
  token: Token;
}) => {
  // Accounts are loaded when user visits the Accounts page, so we need to load them here.
  await loadAccounts({ ledgerCanisterId });
  const store = get(icrcAccountsStore);
  const { accounts } = store[ledgerCanisterId.toText()];
  const main = accounts.find((account) => account.type === "main");

  if (!main) {
    throw new Error("No account found to send tokens");
  }

  await acquireIcrcTokens({
    ulps: numberToUlps({ amount: tokens, token }),
    account: main,
    ledgerCanisterId,
  });

  // Reload accounts to sync tokens that have been transferred
  await loadAccounts({ ledgerCanisterId });
};
