import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import {
  attachCanister as attachCanisterApi,
  createCanister as createCanisterApi,
  detachCanister as detachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  queryCanisterDetails as queryCanisterDetailsApi,
  queryCanisters,
  topUpCanister as topUpCanisterApi,
} from "../api/canisters.api";
import type { CanisterDetails } from "../canisters/ic-management/ic-management.canister.types";
import type {
  CanisterDetails as CanisterInfo,
  SubAccountArray,
} from "../canisters/nns-dapp/nns-dapp.types";
import { E8S_PER_ICP } from "../constants/icp.constants";
import type { CanistersStore } from "../stores/canisters.store";
import { canistersStore } from "../stores/canisters.store";
import { toastsStore } from "../stores/toasts.store";
import { getLastPathDetail } from "../utils/app-path.utils";
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

export const createCanister = async ({
  amount,
  fromSubAccount,
}: {
  amount: number;
  fromSubAccount?: SubAccountArray;
}): Promise<Principal | undefined> => {
  try {
    const icpAmount = convertNumberToICP(amount);
    // TODO: Validate it's enough ICP https://dfinity.atlassian.net/browse/L2-615
    const identity = await getIdentity();
    const canisterId = await createCanisterApi({
      identity,
      amount: icpAmount,
      fromSubAccount,
    });
    await listCanisters({ clearBeforeQuery: false });
    // We don't wait for `syncAccounts` to finish to give a better UX to the user.
    // `syncAccounts` might be slow since it loads all accounts and balances.
    syncAccounts();
    return canisterId;
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return;
  }
};

export const topUpCanister = async ({
  amount,
  canisterId,
  fromSubAccount,
}: {
  amount: number;
  canisterId: Principal;
  fromSubAccount?: SubAccountArray;
}): Promise<{ success: boolean }> => {
  try {
    const icpAmount = convertNumberToICP(amount);
    // TODO: Validate it's enough ICP https://dfinity.atlassian.net/browse/L2-615
    const identity = await getIdentity();
    await topUpCanisterApi({
      identity,
      canisterId,
      amount: icpAmount,
      fromSubAccount,
    });
    // We don't wait for `syncAccounts` to finish to give a better UX to the user.
    // `syncAccounts` might be slow since it loads all accounts and balances.
    syncAccounts();
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

export const getCanisterDetails = async (
  canisterId: Principal
): Promise<CanisterDetails | undefined> => {
  const identity = await getIdentity();
  try {
    return await queryCanisterDetailsApi({
      canisterId,
      identity,
    });
  } catch (error) {
    // TODO: manage errors https://dfinity.atlassian.net/browse/L2-615
  }
};

export const getIcpToCyclesExchangeRate = async (): Promise<
  bigint | undefined
> => {
  try {
    const identity = await getIdentity();
    const trillionRatio = await getIcpToCyclesExchangeRateApi(identity);
    // This transforms to ratio to E8s to T Cycles.
    return trillionRatio / BigInt(E8S_PER_ICP);
  } catch (error) {
    // TODO: Manage proper errors https://dfinity.atlassian.net/browse/L2-615
    return;
  }
};
