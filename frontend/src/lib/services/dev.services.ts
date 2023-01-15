import { acquireICPTs, acquireSnsTokens } from "$lib/api/dev.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import type { AccountsWritableStore } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { syncAccounts } from "./accounts.services";
import { loadSnsAccounts } from "./sns-accounts.services";

export const getICPs = async (icps: number) => {
  const { main }: AccountsWritableStore = get(accountsStore);

  if (!main) {
    throw new Error("No account found to get ICPs");
  }

  await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  await syncAccounts();
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
  const store: SnsAccountsStore = get(snsAccountsStore);
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

  await loadSnsAccounts({ rootCanisterId });
};
