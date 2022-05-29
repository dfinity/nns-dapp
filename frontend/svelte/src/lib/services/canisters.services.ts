import type { Principal } from "@dfinity/principal";
import {
  attachCanister as attachCanisterApi,
  getIcpToCyclesExchangeRate as getIcpToCyclesExchangeRateApi,
  queryCanisterDetails,
  queryCanisters,
} from "../api/canisters.api";
import type {
  CanisterDetails,
  CanisterDetails as CanisterInfo,
} from "../canisters/nns-dapp/nns-dapp.types";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { canistersStore } from "../stores/canisters.store";
import { toastsStore } from "../stores/toasts.store";
import { getPrincipalFromString } from "../utils/accounts.utils";
import { getLastPathDetail } from "../utils/app-path.utils";
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

export const routePathCanisterId = (path: string): Principal | undefined => {
  const maybeIdString = getLastPathDetail(path);
  return maybeIdString !== undefined
    ? getPrincipalFromString(maybeIdString)
    : undefined;
};

export const getCanisterDetails = async (
  canisterId: Principal
): Promise<CanisterDetails | undefined> => {
  const identity = await getIdentity();
  try {
    return await queryCanisterDetails({
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
