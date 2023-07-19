import {
  acquireICPTs,
  acquireSnsTokens,
  getTestAccountBalance,
} from "$lib/api/dev.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import type { IcpAccountsStoreData } from "$lib/stores/icp-accounts.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStoreData,
} from "$lib/stores/sns-accounts.store";
import type { IcpAccount } from "$lib/types/account";
import type { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { syncAccounts } from "./icp-accounts.services";
import { loadSnsAccounts } from "./sns-accounts.services";

export const getTestBalance = getTestAccountBalance;

const getMainAccount = async (): Promise<IcpAccount> => {
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

export const getICPs = async ({
  icps,
  icrcEnabled,
}: {
  icps: number;
  icrcEnabled: boolean;
}) => {
  const main = await getMainAccount();

  if (!main) {
    throw new Error("No account found to get ICPs");
  }

  await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  await syncAccounts(icrcEnabled);
};

export const getTokens = async ({
  tokens,
  rootCanisterId,
}: {
  tokens: number;
  rootCanisterId: Principal;
}) => {
  // Accounts are loaded when user visits the Accounts page, so we need to load them here.
  await loadSnsAccounts({ rootCanisterId });
  const store: SnsAccountsStoreData = get(snsAccountsStore);
  const { accounts } = store[rootCanisterId.toText()];
  const main = accounts.find((account) => account.type === "main");

  if (!main) {
    throw new Error("No account found to send tokens");
  }

  await acquireSnsTokens({
    e8s: BigInt(tokens * E8S_PER_ICP),
    account: main,
    rootCanisterId,
  });

  // Reload accounts to sync tokens that have been transferred
  await loadSnsAccounts({ rootCanisterId });
};
