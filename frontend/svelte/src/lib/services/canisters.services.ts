import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import { queryCanisters } from "../api/canisters.api";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { canistersStore } from "../stores/canisters.store";
import { i18n } from "../stores/i18n";
import { toastsStore } from "../stores/toasts.store";
import { queryAndUpdate } from "../utils/api.utils";
import { errorToString } from "../utils/error.utils";

export const listCanisters = async ({
  clearBeforeQuery,
  identity,
}: {
  clearBeforeQuery?: boolean;
  identity: Identity | null | undefined;
}) => {
  if (clearBeforeQuery === true) {
    canistersStore.setCanisters([]);
  }

  const request = ({
    certified,
  }: {
    certified: boolean;
  }): Promise<CanisterDetails[]> => {
    if (!identity) {
      // TODO: https://dfinity.atlassian.net/browse/L2-346
      throw new Error(get(i18n).error.missing_identity);
    }

    return queryCanisters({ identity, certified });
  };

  return queryAndUpdate<CanisterDetails[], unknown>({
    request,
    onLoad: ({ response: canisters }) => canistersStore.setCanisters(canisters),
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      canistersStore.setCanisters([]);

      toastsStore.show({
        labelKey: "error.list_canisters",
        level: "error",
        detail: errorToString(error),
      });
    },
  });
};
