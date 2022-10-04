import { get } from "svelte/store";
import { acquireICPTs } from "$lib/api/dev.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import type { AccountsStore } from "$lib/stores/accounts.store";
import { accountsStore } from "$lib/stores/accounts.store";
import { syncAccounts } from "./accounts.services";

export const getICPs = async (icps: number) => {
  const { main }: AccountsStore = get(accountsStore);

  if (!main) {
    throw new Error("No account found to get ICPs");
  }

  await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  await syncAccounts();
};
