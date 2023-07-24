import {
  attachCanister as attachCanisterApi,
  createCanister as createCanisterApi,
  detachCanister as detachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  queryCanisterDetails as queryCanisterDetailsApi,
  queryCanisters,
  renameCanister as renameCanisterApi,
  topUpCanister as topUpCanisterApi,
  updateSettings as updateSettingsApi,
} from "$lib/api/canisters.api";
import type {
  CanisterDetails,
  CanisterSettings,
} from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { canistersStore } from "$lib/stores/canisters.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorMessage } from "$lib/types/ledger.errors";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { isController } from "$lib/utils/canisters.utils";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import {
  mapCanisterErrorToToastMessage,
  toToastError,
} from "$lib/utils/error.utils";
import type { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { getAuthenticatedIdentity } from "./auth.services";
import { getAccountIdentity, loadBalance } from "./icp-accounts.services";
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
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: canisters, certified }) =>
      canistersStore.setCanisters({ canisters, certified }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && notForceCallStrategy()) {
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
      name,
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
