import type { KnownNeuron } from "@dfinity/nns";
import * as api from "../api/governance.api";
import { knownNeuronsStore } from "../stores/knownNeurons.store";
import { toastsStore } from "../stores/toasts.store";
import { queryAndUpdate } from "./utils.services";

export const listKnownNeurons = (): Promise<void> => {
  return queryAndUpdate<KnownNeuron[], unknown>({
    request: (options) => api.queryKnownNeurons(options),
    onLoad: ({ response: neurons }) => knownNeuronsStore.setNeurons(neurons),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      knownNeuronsStore.setNeurons([]);

      toastsStore.error({
        labelKey: "error.get_known_neurons",
        err,
      });
    },
    logMessage: "Syncing Known Neurons",
  });
};
