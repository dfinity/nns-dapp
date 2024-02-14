import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { snsTransfer } from "$lib/api/sns-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import { snsTokensByRootCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import type { Account } from "$lib/types/account";
import { numberToE8s } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { loadAccounts } from "./icrc-accounts.services";
import type { QueryAndUpdateStrategy } from "./utils.services";

export const loadSnsAccounts = async ({
  rootCanisterId,
  handleError,
  strategy = FORCE_CALL_STRATEGY,
}: {
  rootCanisterId: Principal;
  handleError?: () => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const ledgerCanisterId = get(snsLedgerCanisterIdsStore)[
    rootCanisterId.toText()
  ];
  return loadAccounts({
    ledgerCanisterId,
    handleError,
    strategy,
  });
};

export const snsTransferTokens = async ({
  rootCanisterId,
  source,
  destinationAddress,
  amount,
}: {
  rootCanisterId: Principal;
  source: Account;
  destinationAddress: string;
  amount: number;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  const fee = get(snsTokensByRootCanisterIdStore)[rootCanisterId.toText()]?.fee;

  return transferTokens({
    source,
    destinationAddress,
    amountUlps: numberToE8s(amount),
    fee,
    transfer: async (
      params: {
        identity: Identity;
      } & IcrcTransferParams
    ) =>
      await snsTransfer({
        ...params,
        rootCanisterId,
      }),
    reloadAccounts: async () => await loadSnsAccounts({ rootCanisterId }),
    reloadTransactions: async () => undefined,
  });
};
