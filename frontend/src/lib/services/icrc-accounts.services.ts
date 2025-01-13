import {
  icrcTransfer,
  queryIcrcBalance,
  queryIcrcToken,
} from "$lib/api/icrc-ledger.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { failedExistentImportedTokenLedgerIdsStore } from "$lib/derived/imported-tokens.derived";
import { snsTokensByLedgerCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import {
  getAuthenticatedIdentity,
  getCurrentIdentity,
} from "$lib/services/auth.services";
import {
  queryAndUpdate,
  type QueryAndUpdateStrategy,
} from "$lib/services/utils.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { isLastCall } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { isImportedToken } from "$lib/utils/imported-tokens.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import type { Identity } from "@dfinity/agent";
import {
  decodeIcrcAccount,
  encodeIcrcAccount,
  type IcrcBlockIndex,
} from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getIcrcAccountIdentity = (_: Account): Promise<Identity> => {
  // TODO: Support Ledger Devices
  return getAuthenticatedIdentity();
};

/// Fetch token metadata from the icrc1 ledger canister.
export const getIcrcTokenMetaData = async ({
  ledgerCanisterId,
}: {
  ledgerCanisterId: Principal;
}): Promise<IcrcTokenMetadata> => {
  return queryIcrcToken({
    identity: getCurrentIdentity(),
    canisterId: ledgerCanisterId,
    certified: false,
  });
};

export const loadIcrcToken = ({
  ledgerCanisterId,
  certified = true,
}: {
  ledgerCanisterId: Principal;
  certified?: boolean;
}) => {
  if (ledgerCanisterId.toText() in get(snsTokensByLedgerCanisterIdStore)) {
    // SNS tokens are derived from aggregator data instead.
    return;
  }
  if (
    get(failedExistentImportedTokenLedgerIdsStore).includes(
      ledgerCanisterId.toText()
    )
  ) {
    // Ensures that imported tokens that failed to load are not fetched again.
    return;
  }

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
    onError: ({ error: err, certified, strategy }) => {
      // Explicitly handle only UPDATE errors
      if (!isLastCall({ strategy, certified })) {
        return;
      }

      if (
        isImportedToken({
          ledgerCanisterId,
          importedTokens: get(importedTokensStore)?.importedTokens,
        })
      ) {
        // Do not display error toasts for imported tokens.
        // Failed imported tokens will be shown with a warning icon in the UI.
        failedImportedTokenLedgerIdsStore.add(ledgerCanisterId.toText());
      } else {
        toastsError({
          labelKey: "error.token_not_found",
          err,
        });
      }

      // Hide unproven data
      tokensStore.resetUniverse(ledgerCanisterId);
    },
  });
};

/**
 * Return all the accounts for the given identity in the ledger canister.
 *
 * For now, it only returns the main account and no subaccounts.
 *
 * Once subaccounts are supported, this function should be updated to return all the accounts.
 */
const getAccounts = async ({
  identity,
  certified,
  ledgerCanisterId,
}: {
  identity: Identity;
  certified: boolean;
  ledgerCanisterId: Principal;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  const mainAccount = {
    owner: identity.getPrincipal(),
  };

  const balanceUlps = await queryIcrcBalance({
    identity,
    certified,
    canisterId: ledgerCanisterId,
    account: mainAccount,
  });

  return [
    {
      identifier: encodeIcrcAccount(mainAccount),
      principal: mainAccount.owner,
      balanceUlps,
      type: "main",
    },
  ];
};

export const loadAccounts = async ({
  handleError,
  ledgerCanisterId,
  strategy = FORCE_CALL_STRATEGY,
}: {
  handleError?: () => void;
  ledgerCanisterId: Principal;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  if (
    get(failedExistentImportedTokenLedgerIdsStore).includes(
      ledgerCanisterId.toText()
    )
  ) {
    // Ensures that imported tokens that failed to load are not fetched again.
    return;
  }

  return queryAndUpdate<Account[], unknown>({
    strategy,
    request: ({ certified, identity }) =>
      getAccounts({ identity, certified, ledgerCanisterId }),
    onLoad: ({ response: accounts, certified }) =>
      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: {
          accounts,
          certified,
        },
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      // Ignore error on query call only if there will be an update call
      if (certified !== true && strategy !== "query") {
        return;
      }

      // hide unproven data
      icrcAccountsStore.resetUniverse(ledgerCanisterId);
      icrcTransactionsStore.resetUniverse(ledgerCanisterId);

      if (
        isImportedToken({
          ledgerCanisterId,
          importedTokens: get(importedTokensStore)?.importedTokens,
        })
      ) {
        // Do not display error toasts for imported tokens.
        // Failed imported tokens will be shown with a warning icon in the UI.
        failedImportedTokenLedgerIdsStore.add(ledgerCanisterId.toText());
      } else {
        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error.accounts_load",
          })
        );
      }

      handleError?.();
    },
    logMessage: "Syncing Accounts",
  });
};

export const syncAccounts = async ({
  ledgerCanisterId,
}: {
  ledgerCanisterId: Principal;
}) =>
  await Promise.all([
    loadAccounts({ ledgerCanisterId }),
    loadIcrcToken({ ledgerCanisterId }),
  ]);

///
/// These following services are implicitly covered by their consumers' services testing - i.e. ckbtc-accounts.services.spec and sns-accounts.services.spec
///

export interface IcrcTransferTokensUserParams {
  source: Account;
  destinationAddress: string;
  amountUlps: bigint;
  ledgerCanisterId: Principal;
  fee: bigint;
}

export const transferTokens = async ({
  source,
  destinationAddress,
  amountUlps,
  fee,
  ledgerCanisterId,
}: IcrcTransferTokensUserParams): Promise<{
  blockIndex: IcrcBlockIndex | undefined;
}> => {
  try {
    if (isNullish(fee)) {
      throw new Error("error.transaction_fee_not_found");
    }

    const identity: Identity = await getIcrcAccountIdentity(source);
    const to = decodeIcrcAccount(destinationAddress);

    const blockIndex = await icrcTransfer({
      identity,
      to,
      fromSubAccount: source.subAccount,
      amount: amountUlps,
      fee,
      canisterId: ledgerCanisterId,
    });

    await loadAccounts({ ledgerCanisterId });

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
