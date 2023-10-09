import { updateNeuron } from "$lib/api/governace-test.api";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { E8s, Neuron, NeuronInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { getAuthenticatedIdentity } from "./auth.services";
import { getAndLoadNeuron } from "./neurons.services";

export const addMaturity = async ({
  neuron,
  amountE8s,
}: {
  neuron: NeuronInfo;
  amountE8s: E8s;
}): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();

    if (isNullish(neuron.fullNeuron)) {
      throw new Error(
        `Full neuron is not defined for neuron ${neuron.neuronId}`
      );
    }

    const newNeuron: Neuron = {
      ...neuron.fullNeuron,
      maturityE8sEquivalent:
        neuron.fullNeuron.maturityE8sEquivalent + amountE8s,
    };

    await updateNeuron({
      neuron: newNeuron,
      identity,
    });

    await getAndLoadNeuron(neuron.neuronId);

    toastsSuccess({
      labelKey: "neuron_detail.add_maturity_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "error.add_maturity",
      err,
    });
  }
};
