import {
  icrcTransfer,
  queryIcrcBalance,
  queryIcrcToken,
  type IcrcTransferParams,
} from "$lib/api/icrc-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import {
  decodeIcrcAccount,
  encodeIcrcAccount,
  type IcrcAccount,
  type IcrcBlockIndex,
} from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { queryAndUpdate } from "./utils.services";

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
  return queryAndUpdate<IcrcTokenMetadata, unknown>({
    strategy: certified ? FORCE_CALL_STRATEGY : "query",
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

const getIcrcMainIdentityAccount = async ({
  ledgerCanisterId,
  identity,
  certified,
}: {
  ledgerCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<Account> => {
  const account: IcrcAccount = {
    owner: identity.getPrincipal(),
  };

  const balanceE8s = await queryIcrcBalance({
    identity,
    canisterId: ledgerCanisterId,
    certified,
    account,
  });

  return {
    identifier: encodeIcrcAccount(account),
    principal: account.owner,
    balanceE8s,
    type: "main",
  };
};

export const loadIcrcAccount = ({
  ledgerCanisterId,
  certified,
}: {
  ledgerCanisterId: Principal;
  certified: boolean;
}) => {
  return queryAndUpdate<Account, unknown>({
    strategy: certified ? FORCE_CALL_STRATEGY : "query",
    request: ({ certified, identity }) =>
      getIcrcMainIdentityAccount({
        identity,
        ledgerCanisterId,
        certified,
      }),
    onLoad: async ({ response: account, certified }) =>
      icrcAccountsStore.set({
        accounts: { accounts: [account], certified },
        universeId: ledgerCanisterId,
      }),
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

export const loadIcrcAccounts = async ({
  ledgerCanisterIds,
  certified,
}: {
  ledgerCanisterIds: Principal[];
  certified: boolean;
}) => {
  const results: PromiseSettledResult<[void, void]>[] =
    await Promise.allSettled(
      ledgerCanisterIds.map((ledgerCanisterId) =>
        Promise.all([
          loadIcrcAccount({ ledgerCanisterId, certified }),
          loadIcrcToken({ ledgerCanisterId, certified }),
        ])
      )
    );

  const error: boolean =
    results.find(({ status }) => status === "rejected") !== undefined;
  if (error) {
    toastsError({ labelKey: "error.sns_accounts_balance_load" });
  }
};

///
/// These following services are implicitly covered by their consumers' services testing - i.e. ckbtc-accounts.services.spec and sns-accounts.services.spec
///

export interface IcrcTransferTokensUserParams {
  source: Account;
  destinationAddress: string;
  amount: number;
}

// TODO: use `wallet-accounts.services`
export const transferTokens = async ({
  source,
  destinationAddress,
  amount,
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

    const amountE8s = numberToE8s(amount);
    const identity: Identity = await getIcrcAccountIdentity(source);
    const to = decodeIcrcAccount(destinationAddress);

    const blockIndex = await transfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      amount: amountE8s,
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
  amount,
  fee,
  ledgerCanisterId,
}: IcrcTransferTokensUserParams & {
  fee: bigint;
  ledgerCanisterId: Principal;
}): Promise<{ blockIndex: IcrcBlockIndex | undefined }> => {
  return transferTokens({
    source,
    amount,
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
    reloadAccounts: async () =>
      await loadIcrcAccount({ ledgerCanisterId, certified: true }),
    // Web workders take care of refreshing transactions
    reloadTransactions: () => Promise.resolve(),
  });
};
