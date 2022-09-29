import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { acquireICPTs, acquireSnsTokens } from "../api/dev.api";
import { E8S_PER_ICP } from "../constants/icp.constants";
import type { AccountsStore } from "../stores/accounts.store";
import { accountsStore } from "../stores/accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "../stores/sns-accounts.store";
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

export const getTokens = async ({
  tokens,
  rootCanisterId,
}: {
  tokens: number;
  rootCanisterId: Principal;
}) => {
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

  await syncAccounts();
};
