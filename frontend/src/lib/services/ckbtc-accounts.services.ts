import { ckBTCTokenStore } from "$lib/derived/universes-tokens.derived";
import { icrcTransferTokens } from "$lib/services/icrc-accounts.services";
import { loadAccounts } from "$lib/services/wallet-accounts.services";
import { toastsError } from "$lib/stores/toasts.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import type { IcrcBlockIndex } from "@dfinity/ledger-icrc";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import type { IcrcTransferTokensUserParams } from "./icrc-accounts.services";

export const loadCkBTCAccounts = async (params: {
  handleError?: () => void;
  universeId: UniverseCanisterId;
}): Promise<void> => loadAccounts(params);

export const ckBTCTransferTokens = async ({
  universeId,
  ...rest
}: IcrcTransferTokensUserParams & {
  universeId: UniverseCanisterId;
}): Promise<{
  blockIndex: IcrcBlockIndex | undefined;
}> => {
  const fee = get(ckBTCTokenStore)[universeId.toText()]?.token.fee;

  if (isNullish(fee)) {
    toastsError(
      ledgerErrorToToastError({
        fallbackErrorLabelKey: "error.transaction_error",
        err: new Error("error.transaction_fee_not_found"),
      })
    );

    return { blockIndex: undefined };
  }

  return icrcTransferTokens({
    ledgerCanisterId: universeId,
    fee,
    ...rest,
  });
};
