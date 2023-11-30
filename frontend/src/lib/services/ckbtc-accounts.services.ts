import type { IcrcTransferParams } from "$lib/api/icrc-ledger.api";
import { icrcTransfer } from "$lib/api/icrc-ledger.api";
import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { loadAccounts } from "$lib/services/wallet-accounts.services";
import type { UniverseCanisterId } from "$lib/types/universe";
import type { Identity } from "@dfinity/agent";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import { get } from "svelte/store";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";

export const loadCkBTCAccounts = async (params: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}): Promise<void> => loadAccounts(params);

export const ckBTCTransferTokens = async ({
  source,
  universeId,
  ...rest
}: IcrcTransferTokensUserParams & {
  universeId: UniverseCanisterId;
}): Promise<{
  blockIndex: IcrcBlockIndex | undefined;
}> => {
  const fee = get(ckBTCTokenStore)[universeId.toText()]?.token.fee;

  return transferTokens({
    source,
    fee,
    ...rest,
    transfer: async (
      params: {
        identity: Identity;
      } & IcrcTransferParams
    ) =>
      await icrcTransfer({
        ...params,
        canisterId: universeId,
      }),
    reloadAccounts: async () => await loadAccounts({ universeId }),
    reloadTransactions: async () => Promise.resolve(),
  });
};
