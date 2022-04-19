import type { KnownNeuron } from "@dfinity/nns";
import * as api from "../api/governance.api";
import { knownNeuronsStore } from "../stores/knownNeurons.store";
import { toastsStore } from "../stores/toasts.store";
import { errorToString } from "../utils/error.utils";
import { queryAndUpdate } from "./utils.services";

export const listKnownNeurons = (): Promise<void> => {
  return queryAndUpdate<KnownNeuron[], unknown>({
    request: (options) => api.queryKnownNeurons(options),
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
    logMessage: "Syncing Known Neurons",
  });
};
