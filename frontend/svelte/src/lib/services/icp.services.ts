import type { BlockHeight, TransferError } from "@dfinity/nns";
import { get } from "svelte/store";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { AccountsStore, accountsStore } from "../stores/accounts.store";
import { AuthStore, authStore } from "../stores/auth.store";
import { acquireICPTs } from "../utils/dev.utils";

export const getIPCs = async (icps: number) => {
  const { main }: AccountsStore = get(accountsStore);

  const result: BlockHeight | TransferError = await acquireICPTs({
    e8s: BigInt(icps * E8S_PER_ICP),
    accountIdentifier: main.identifier,
  });

  if (!(typeof result === "bigint")) {
    console.error(result);
    throw new Error(JSON.stringify(result));
  }

  const { principal }: AuthStore = get(authStore);
  await accountsStore.sync({ principal });
};
