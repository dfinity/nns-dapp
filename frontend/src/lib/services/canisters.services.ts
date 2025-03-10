import {
  attachCanister as attachCanisterApi,
  createCanister as createCanisterApi,
  detachCanister as detachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  notifyAndAttachCanister,
  notifyTopUpCanister,
  queryCanisterDetails as queryCanisterDetailsApi,
  queryCanisters,
  renameCanister as renameCanisterApi,
  topUpCanister as topUpCanisterApi,
  updateSettings as updateSettingsApi,
} from "$lib/api/canisters.api";
import { getTransactions } from "$lib/api/icp-index.api";
import type {
  CanisterDetails,
  CanisterSettings,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { CYCLES_MINTING_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import {
  getAccountIdentity,
  loadBalance,
} from "$lib/services/icp-accounts.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { canistersStore } from "$lib/stores/canisters.store";
import { checkedAttachCanisterBlockIndicesStore } from "$lib/stores/checked-block-indices.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorMessage } from "$lib/types/ledger.errors";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import {
  getCanisterCreationCmcAccountIdentifierHex,
  isController,
} from "$lib/utils/canisters.utils";
import { isLastCall } from "$lib/utils/env.utils";
import {
  mapCanisterErrorToToastMessage,
  toToastError,
} from "$lib/utils/error.utils";
import { AnonymousIdentity } from "@dfinity/agent";
import {
  AccountIdentifier,
  SubAccount,
  type TransactionWithId,
} from "@dfinity/ledger-icp";
import type { Principal } from "@dfinity/principal";
import {
  ICPToken,
  TokenAmountV2,
  fromNullable,
  isNullish,
  nonNullish,
  principalToSubAccount,
} from "@dfinity/utils";
import { get } from "svelte/store";

export const listCanisters = async ({
  clearBeforeQuery,
}: {
  clearBeforeQuery?: boolean;
}) => {
  if (clearBeforeQuery === true) {
    canistersStore.setCanisters({ canisters: undefined, certified: true });
  }

  return queryAndUpdate<CanisterInfo[], unknown>({
    request: (options) => queryCanisters(options),
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: canisters, certified }) =>
      canistersStore.setCanisters({ canisters, certified }),
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (!isLastCall({ strategy, certified })) {
        return;
      }

      // Explicitly handle only UPDATE errors
      canistersStore.setCanisters({ canisters: [], certified: true });

      toastsError({
        labelKey: "error.list_canisters",
        err,
      });
    },
    logMessage: "Syncing Canisters",
  });
};

export const createCanister = async ({
  amount,
  account,
  name,
}: {
  amount: number;
  account: Account;
  name?: string;
}): Promise<Principal | undefined> => {
  try {
    const icpAmount = TokenAmountV2.fromNumber({ amount, token: ICPToken });
    if (!(icpAmount instanceof TokenAmountV2)) {
      throw new LedgerErrorMessage("error.amount_not_valid");
    }
    assertEnoughAccountFunds({ amountUlps: icpAmount.toUlps(), account });

    const identity = await getAccountIdentity(account.identifier);
    const fee = get(mainTransactionFeeE8sStore);
    const canisterId = await createCanisterApi({
      identity,
      amount: icpAmount.toUlps(),
      fromSubAccount: account.subAccount,
      name,
      fee,
    });
    await listCanisters({ clearBeforeQuery: false });
    // We don't wait for `loadBalance` to finish to give a better UX to the user.
    // update calls might be slow.
    loadBalance({ accountIdentifier: account.identifier });
    return canisterId;
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_creation_unknown")
    );
    return;
  }
};

export const renameCanister = async ({
  name,
  canisterId,
}: {
  name: string;
  canisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await renameCanisterApi({
      identity,
      name,
      canisterId,
    });
    await listCanisters({ clearBeforeQuery: false });
    return { success: true };
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_creation_unknown")
    );
    return { success: false };
  }
};

export const topUpCanister = async ({
  amount,
  canisterId,
  account,
}: {
  amount: number;
  canisterId: Principal;
  account: Account;
}): Promise<{ success: boolean }> => {
  try {
    const icpAmount = TokenAmountV2.fromNumber({ amount, token: ICPToken });
    if (!(icpAmount instanceof TokenAmountV2)) {
      throw new LedgerErrorMessage("error.amount_not_valid");
    }
    assertEnoughAccountFunds({ amountUlps: icpAmount.toUlps(), account });

    const identity = await getAccountIdentity(account.identifier);
    const fee = get(mainTransactionFeeE8sStore);
    await topUpCanisterApi({
      identity,
      canisterId,
      amount: icpAmount.toUlps(),
      fromSubAccount: account.subAccount,
      fee,
    });
    // We don't wait for `loadBalance` to finish to give a better UX to the user.
    // update calls might be slow.
    loadBalance({ accountIdentifier: account.identifier });
    return { success: true };
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_top_up_unknown")
    );
    return { success: false };
  }
};

// Returns the blockheight of the transaction, if it was a canister top-up, or
// undefined otherwise.
const getBlockHeightFromCanisterTopUp = ({
  id: blockHeight,
  transaction: { memo, operation },
}: TransactionWithId): bigint | undefined => {
  if (memo !== TOP_UP_CANISTER_MEMO || !("Transfer" in operation)) {
    return undefined;
  }
  return blockHeight;
};

// Returns true if notify_top_up was called (whether successful or not).
export const notifyTopUpIfNeeded = async ({
  canisterId,
}: {
  canisterId: Principal;
}): Promise<boolean> => {
  const subAccount = principalToSubAccount(canisterId);
  const cmcAccountIdentifier = AccountIdentifier.fromPrincipal({
    principal: CYCLES_MINTING_CANISTER_ID,
    subAccount: SubAccount.fromBytes(subAccount) as SubAccount,
  });
  const cmcAccountIdentifierHex = cmcAccountIdentifier.toHex();

  const {
    balance,
    transactions: [transaction],
  } = await getTransactions({
    identity: new AnonymousIdentity(),
    maxResults: 1n,
    accountIdentifier: cmcAccountIdentifierHex,
  });

  if (balance === 0n || isNullish(transaction)) {
    return false;
  }

  const blockHeight = getBlockHeightFromCanisterTopUp(transaction);

  if (isNullish(blockHeight)) {
    // This should be very rare but it might be useful to know if it happens.
    console.warn(
      "CMC subaccount has non-zero balance but the most recent transaction is not a top-up",
      {
        canisterId: canisterId.toText(),
        cmcAccountIdentifierHex,
        balance,
        transaction,
      }
    );
    return false;
  }

  try {
    await notifyTopUpCanister({
      identity: new AnonymousIdentity(),
      blockHeight,
      canisterId,
    });
  } catch (error: unknown) {
    console.error(error);
    // Ignore. This is just a background fallback.
  }
  return true;
};

export const addController = async ({
  controller,
  canisterDetails,
}: {
  controller: string;
  canisterDetails: CanisterDetails;
}): Promise<{ success: boolean }> => {
  if (isController({ controller, canisterDetails })) {
    toastsError({
      labelKey: "error.controller_already_present",
      substitutions: {
        $principal: controller,
      },
    });
    return { success: false };
  }
  const newControllers = [...canisterDetails.settings.controllers, controller];
  const newSettings = {
    ...canisterDetails.settings,
    controllers: newControllers,
  };
  return updateSettings({
    canisterId: canisterDetails.id,
    settings: newSettings,
  });
};

export const removeController = async ({
  controller,
  canisterDetails,
}: {
  controller: string;
  canisterDetails: CanisterDetails;
}): Promise<{ success: boolean }> => {
  if (!isController({ controller, canisterDetails })) {
    toastsError({
      labelKey: "error.controller_not_present",
    });
    return { success: false };
  }
  const newControllers = canisterDetails.settings.controllers.filter(
    (currentController) => currentController !== controller
  );
  const newSettings = {
    ...canisterDetails.settings,
    controllers: newControllers,
  };
  return updateSettings({
    canisterId: canisterDetails.id,
    settings: newSettings,
  });
};

// Export for testing purposes, better expose specific functions to be used in controllers.
export const updateSettings = async ({
  settings,
  canisterId,
}: {
  settings: Partial<CanisterSettings>;
  canisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await updateSettingsApi({
      identity,
      canisterId,
      settings,
    });
    return { success: true };
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_update_settings")
    );
    return { success: false };
  }
};

export const attachCanister = async ({
  name,
  canisterId,
}: {
  name?: string;
  canisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await attachCanisterApi({
      identity,
      canisterId,
      name,
    });
    await listCanisters({ clearBeforeQuery: false });
    return { success: true };
  } catch (err) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__canister.unknown_link",
      })
    );
    return { success: false };
  }
};

export const detachCanister = async (
  canisterId: Principal
): Promise<{ success: boolean }> => {
  let success = false;
  try {
    const identity = await getAuthenticatedIdentity();
    await detachCanisterApi({
      identity,
      canisterId,
    });
    success = true;
    await listCanisters({ clearBeforeQuery: false });
    return { success };
  } catch (err) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__canister.unknown_unlink",
      })
    );
    return { success };
  }
};

/**
 * Makes a call to the IC Management "canister" to get the canister details
 *
 * @param canisterId: Principal
 * @returns CanisterDetails
 * @throws UserNotTheControllerError
 * @throws Error
 */
export const getCanisterDetails = async (
  canisterId: Principal
): Promise<CanisterDetails> => {
  const identity = await getAuthenticatedIdentity();
  return queryCanisterDetailsApi({
    canisterId,
    identity,
  });
};

export const getIcpToCyclesExchangeRate = async (): Promise<
  bigint | undefined
> => {
  try {
    const identity = await getAuthenticatedIdentity();
    return await getIcpToCyclesExchangeRateApi(identity);
  } catch (err) {
    toastsError({
      labelKey: "error__canister.get_exchange_rate",
      err,
    });
    return;
  }
};

const getCanisterCreationBlockIndices = ({
  controller,
  transactions,
}: {
  controller: Principal;
  transactions: TransactionWithId[];
}): bigint[] => {
  const cmcAccountIdentifier = getCanisterCreationCmcAccountIdentifierHex({
    controller,
  });
  return transactions
    .map(({ id: blockIndex, transaction }) => {
      const { memo } = transaction;
      if (memo !== CREATE_CANISTER_MEMO) {
        return undefined;
      }
      if (
        "Transfer" in transaction.operation &&
        transaction.operation.Transfer.to === cmcAccountIdentifier
      ) {
        return blockIndex;
      }
    })
    .filter(nonNullish);
};

export const notifyAndAttachCanisterIfNeeded = async ({
  transactions,
  canisters,
}: {
  transactions: TransactionWithId[];
  canisters: CanisterInfo[];
}): Promise<void> => {
  const identity = await getAuthenticatedIdentity();
  const controller = identity.getPrincipal();
  const newBlockIndices = getCanisterCreationBlockIndices({
    controller,
    transactions,
  });
  const existingBlockIndices = new Set(
    canisters
      .map((canister) => fromNullable(canister.block_index))
      .filter(nonNullish)
  );

  for (const blockIndex of newBlockIndices) {
    if (existingBlockIndices.has(blockIndex)) {
      continue;
    }
    if (!checkedAttachCanisterBlockIndicesStore.addBlockIndex(blockIndex)) {
      return;
    }
    // This may also trigger for canisters that were created before we stored
    // the block_index of each canister. That will simply backfill the
    // block_index for those canisters, preventing this from happening again in
    // the future.
    await notifyAndAttachCanister({
      identity,
      blockIndex,
    });
  }
};
