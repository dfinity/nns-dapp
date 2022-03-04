import type { BlockHeight, TransferError } from "@dfinity/nns";
import { InsufficientFunds } from "@dfinity/nns";
import { get } from "svelte/store";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { AccountsStore, accountsStore } from "../stores/accounts.store";
import { AuthStore, authStore } from "../stores/auth.store";
import { acquireICPTs } from "../utils/dev.utils";
import { syncAccounts } from "./accounts.services";

export const getICPs = async (icps: number) => {
  const { main }: AccountsStore = get(accountsStore);

  if (!main) {
    return;
  }

  const result: BlockHeight | TransferError = await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  if (!(typeof result === "bigint")) {
    console.error(result);
    if (result instanceof InsufficientFunds) {
      throw new Error(
        `Insuficient funds in source account: ${
          Number(result.balance.toE8s()) / E8S_PER_ICP
        }`
      );
    }
    throw new Error(JSON.stringify(result));
  }

  const { identity }: AuthStore = get(authStore);

  if (identity) {
    await syncAccounts({ identity });
  }
};
