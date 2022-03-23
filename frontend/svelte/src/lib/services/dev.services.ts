import { get } from "svelte/store";
import { acquireICPTs } from "../api/dev.api";
import { E8S_PER_ICP } from "../constants/icp.constants";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import type { AuthStore } from "../stores/auth.store";
import { authStore } from "../stores/auth.store";
import { syncAccounts } from "./accounts.services";

export const getICPs = async (icps: number) => {
  const { main }: AccountsStore = get(accountsStore);

  if (!main) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No account found to get ICPs");
  }

  await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  const { identity }: AuthStore = get(authStore);

  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error("No identity found to sync accounts after getting ICPs");
  }

  await syncAccounts({ identity });
};
