import type { Principal } from "@dfinity/principal";
import {
  attachCanister as attachCanisterApi,
  queryCanisters,
} from "../api/canisters.api";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { canistersStore } from "../stores/canisters.store";
import { toastsStore } from "../stores/toasts.store";
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

  return queryAndUpdate<CanisterDetails[], unknown>({
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
