import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { queuedStore, type QueuedStore } from "$lib/stores/queued-store";

export interface IcpAccountDetailsStoreData {
  accountDetails: AccountDetails;
  certified: boolean;
}

export type IcpAccountDetailsStore = QueuedStore<
  IcpAccountDetailsStoreData | undefined
>;

export const icpAccountDetailsStore = queuedStore<
  IcpAccountDetailsStoreData | undefined
>(undefined);
