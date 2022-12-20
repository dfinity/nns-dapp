import {
  attachCanister as attachCanisterApi,
  createCanister as createCanisterApi,
  detachCanister as detachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  installCode as installCodeApi,
  queryCanisterDetails as queryCanisterDetailsApi,
  queryCanisters,
  topUpCanister as topUpCanisterApi,
  updateSettings as updateSettingsApi,
} from "$lib/api/canisters.api";
import type {
  CanisterDetails,
  CanisterSettings,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { canistersStore } from "$lib/stores/canisters.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorMessage } from "$lib/types/ledger.errors";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { isController } from "$lib/utils/canisters.utils";
import { sha256 } from "$lib/utils/crypto.utils";
import {
  mapCanisterErrorToToastMessage,
  toToastError,
} from "$lib/utils/error.utils";
import { isNullish } from "$lib/utils/utils";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { getAccountIdentity, syncAccounts } from "./accounts.services";
import { getAuthenticatedIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

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
    onLoad: ({ response: canisters, certified }) =>
      canistersStore.setCanisters({ canisters, certified }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
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
}: {
  amount: number;
  account: Account;
}): Promise<Principal | undefined> => {
  try {
    const icpAmount = TokenAmount.fromNumber({ amount, token: ICPToken });
    if (!(icpAmount instanceof TokenAmount)) {
      throw new LedgerErrorMessage("error.amount_not_valid");
    }
    assertEnoughAccountFunds({ amountE8s: icpAmount.toE8s(), account });

    const identity = await getAccountIdentity(account.identifier);
    const canisterId = await createCanisterApi({
      identity,
      amount: icpAmount,
      fromSubAccount: account.subAccount,
    });
    await listCanisters({ clearBeforeQuery: false });
    // We don't wait for `syncAccounts` to finish to give a better UX to the user.
    // `syncAccounts` might be slow since it loads all accounts and balances.
    syncAccounts();
    return canisterId;
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_creation_unknown")
    );
    return;
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
    const icpAmount = TokenAmount.fromNumber({ amount, token: ICPToken });
    if (!(icpAmount instanceof TokenAmount)) {
      throw new LedgerErrorMessage("error.amount_not_valid");
    }
    assertEnoughAccountFunds({ amountE8s: icpAmount.toE8s(), account });

    const identity = await getAccountIdentity(account.identifier);
    await topUpCanisterApi({
      identity,
      canisterId,
      amount: icpAmount,
      fromSubAccount: account.subAccount,
    });
    // We don't wait for `syncAccounts` to finish to give a better UX to the user.
    // `syncAccounts` might be slow since it loads all accounts and balances.
    syncAccounts();
    return { success: true };
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_top_up_unknown")
    );
    return { success: false };
  }
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

export const attachCanister = async (
  canisterId: Principal
): Promise<{ success: boolean }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await attachCanisterApi({
      identity,
      canisterId,
    });
    await listCanisters({ clearBeforeQuery: false });
    return { success: true };
  } catch (err) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__canister.unknown_attach",
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
        fallbackErrorLabelKey: "error__canister.unknown_detach",
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

export const installCode = async ({
  canisterId,
  blob,
  hash,
}: {
  canisterId: Principal;
  blob: Blob | undefined;
  hash: string | undefined;
}): Promise<{ success: boolean }> => {
  try {
    if (isNullish(blob)) {
      toastsError({
        labelKey: "error__canister.no_wasm",
      });
      return { success: false };
    }

    // Verify hash once again
    const sha = await sha256(blob);

    if (sha !== hash || isNullish(hash) || hash === "") {
      toastsError({
        labelKey: "error__canister.invalid_hash",
      });
      return { success: false };
    }

    const identity = await getAuthenticatedIdentity();

    await installCodeApi({ identity, canisterId, blob });

    return { success: true };
  } catch (error: unknown) {
    toastsShow(
      mapCanisterErrorToToastMessage(error, "error.canister_top_up_unknown")
    );
    return { success: false };
  }
};
