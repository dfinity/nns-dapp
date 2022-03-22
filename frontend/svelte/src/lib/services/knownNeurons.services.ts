import type { Identity } from "@dfinity/agent";
import type { KnownNeuron } from "@dfinity/nns";
import { get } from "svelte/store";
import * as api from "../api/governance.api";
import { i18n } from "../stores/i18n";
import { knownNeuronsStore } from "../stores/knownNeurons.store";
import { toastsStore } from "../stores/toasts.store";
import { queryAndUpdate } from "../utils/api.utils";
import { errorToString } from "../utils/error.utils";

export const listKnownNeurons = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}) => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error(get(i18n).error.missing_identity);
  }

  queryAndUpdate<KnownNeuron[], unknown>({
    request: ({ certified }) =>
      api.queryKnownNeurons({
        identity,
        certified,
      }),
    onLoad: ({ response: neurons }) => knownNeuronsStore.setNeurons(neurons),
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      knownNeuronsStore.setNeurons([]);

      toastsStore.show({
        labelKey: "error.get_known_neurons",
        level: "error",
        detail: errorToString(error),
      });
    },
  });
};
