import {
  icrcTransfer,
  queryIcrcToken,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import type { Identity } from "@dfinity/agent";
import { decodeIcrcAccount, type IcrcBlockIndex } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";
import { loadAccounts } from "./wallet-accounts.services";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIcrcAccountIdentity = (_: Account): Promise<Identity> => {
  // TODO: Support Hardware Wallets
  return getAuthenticatedIdentity();
};

export const loadIcrcToken = ({
  ledgerCanisterId,
  certified,
}: {
  ledgerCanisterId: Principal;
  certified: boolean;
}) => {
  const currentToken = get(tokensStore)[ledgerCanisterId.toText()];

  if (nonNullish(currentToken) && (currentToken.certified || !certified)) {
    return;
  }

  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    strategy: certified ? FORCE_CALL_STRATEGY : "query",
    identityType: "current",
    request: ({ certified, identity }) =>
      queryIcrcToken({
        identity,
        canisterId: ledgerCanisterId,
        certified,
      }),
    onLoad: async ({ response: token, certified }) =>
      tokensStore.setToken({ certified, canisterId: ledgerCanisterId, token }),
    onError: ({ error: err, certified }) => {
      if (!certified && notForceCallStrategy()) {
        return;
      }

      // Explicitly handle only UPDATE errors
      toastsError({
        labelKey: "error.token_not_found",
        err,
      });

      // Hide unproven data
      tokensStore.resetUniverse(ledgerCanisterId);
    },
  });
};

///
/// These following services are implicitly covered by their consumers' services testing - i.e. ckbtc-accounts.services.spec and sns-accounts.services.spec
///

export interface IcrcTransferTokensUserParams {
  source: Account;
  destinationAddress: string;
  amountUlps: bigint;
}

// TODO: use `wallet-accounts.services`
export const transferTokens = async ({
  source,
  destinationAddress,
  amountUlps,
  fee,
  transfer,
  reloadAccounts,
  reloadTransactions,
}: IcrcTransferTokensUserParams & {
  fee: bigint | undefined;
  transfer: (
    params: {
      identity: Identity;
    } & IcrcTransferParams
  ) => Promise<IcrcBlockIndex>;
  reloadAccounts: () => Promise<void>;
  reloadTransactions: () => Promise<void>;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  try {
    if (isNullish(fee)) {
      throw new Error("error.transaction_fee_not_found");
    }

    const identity: Identity = await getIcrcAccountIdentity(source);
    const to = decodeIcrcAccount(destinationAddress);

    const blockIndex = await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      amount: amountUlps,
      fee,
    });

    await Promise.all([reloadAccounts(), reloadTransactions()]);

    return { blockIndex };
  } catch (err) {
    toastsError(
      ledgerErrorToToastError({
        fallbackErrorLabelKey: "error.transaction_error",
        err,
      })
    );

    return { blockIndex: undefined };
  }
};

export const icrcTransferTokens = async ({
  source,
  destinationAddress,
  amountUlps,
  fee,
  ledgerCanisterId,
}: IcrcTransferTokensUserParams & {
  fee: bigint;
  ledgerCanisterId: Principal;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  return transferTokens({
    source,
    amountUlps,
    fee,
    destinationAddress,
    transfer: async (
      params: {
        identity: Identity;
      } & IcrcTransferParams
    ) =>
      await icrcTransfer({
        ...params,
        canisterId: ledgerCanisterId,
      }),
    reloadAccounts: async () => loadAccounts({ ledgerCanisterId }),
    // Web workders take care of refreshing transactions
    reloadTransactions: () => Promise.resolve(),
  });
};
