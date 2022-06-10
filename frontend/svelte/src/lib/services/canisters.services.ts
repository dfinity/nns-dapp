import type { ICP } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  attachCanister as attachCanisterApi,
  createCanister as createCanisterApi,
  detachCanister as detachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  queryCanisterDetails as queryCanisterDetailsApi,
  queryCanisters,
  topUpCanister as topUpCanisterApi,
  updateSettings as updateSettingsApi,
} from "../api/canisters.api";
import type {
  CanisterDetails,
  CanisterSettings,
} from "../canisters/ic-management/ic-management.canister.types";
import type { CanisterDetails as CanisterInfo } from "../canisters/nns-dapp/nns-dapp.types";
import { canistersStore } from "../stores/canisters.store";
import { toastsStore } from "../stores/toasts.store";
import type { Account } from "../types/account";
import { InsufficientAmountError } from "../types/common.errors";
import { getLastPathDetail } from "../utils/app-path.utils";
import { isController } from "../utils/canisters.utils";
import { mapCanisterErrorToToastMessage } from "../utils/error.utils";
import { convertNumberToICP } from "../utils/icp.utils";
import { syncAccounts } from "./accounts.services";
import { getIdentity } from "./auth.services";
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

      toastsStore.error({
        labelKey: "error.list_canisters",
        err,
      });
    },
    logMessage: "Syncing Canisters",
  });
};

/**
 * @throws InsufficientAmountError
 */
const assertEnoughBalance = ({
  amount,
  account,
}: {
  amount: ICP;
  account: Account;
}): void => {
  if (amount.toE8s() > account.balance.toE8s()) {
    throw new InsufficientAmountError();
  }
};

export const createCanister = async ({
  amount,
  account,
}: {
  amount: number;
  account: Account;
}): Promise<Principal | undefined> => {
  try {
    const icpAmount = convertNumberToICP(amount);
    assertEnoughBalance({ amount: icpAmount, account });

    const identity = await getIdentity();
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
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    toastsStore.show(mapCanisterErrorToToastMessage(error));
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
    const icpAmount = convertNumberToICP(amount);
    assertEnoughBalance({ amount: icpAmount, account });

    const identity = await getIdentity();
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
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    toastsStore.show(mapCanisterErrorToToastMessage(error));
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
    toastsStore.error({
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
    toastsStore.error({
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
    const identity = await getIdentity();
    await updateSettingsApi({
      identity,
      canisterId,
      settings,
    });
    return { success: true };
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return { success: false };
  }
};

export const attachCanister = async (
  canisterId: Principal
): Promise<{ success: boolean }> => {
  try {
    const identity = await getIdentity();
    await attachCanisterApi({
      identity,
      canisterId,
    });
    await listCanisters({ clearBeforeQuery: false });
    return { success: true };
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return { success: false };
  }
};

export const detachCanister = async (
  canisterId: Principal
): Promise<{ success: boolean }> => {
  let success = false;
  try {
    const identity = await getIdentity();
    await detachCanisterApi({
      identity,
      canisterId,
    });
    success = true;
    await listCanisters({ clearBeforeQuery: false });
    return { success };
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return { success };
  }
};

export const routePathCanisterId = (
  path: string | undefined
): string | undefined => {
  const canisterId: string | undefined = getLastPathDetail(path);
  return canisterId !== undefined && canisterId !== "" ? canisterId : undefined;
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
  const identity = await getIdentity();
  return queryCanisterDetailsApi({
    canisterId,
    identity,
  });
};

export const getIcpToCyclesExchangeRate = async (): Promise<
  bigint | undefined
> => {
  try {
    const identity = await getIdentity();
    return await getIcpToCyclesExchangeRateApi(identity);
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return;
  }
};
