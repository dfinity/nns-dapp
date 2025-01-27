import { updateNeuron } from "$lib/api/governace-test.api";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { getAndLoadNeuron } from "$lib/services/neurons.services";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { E8s, Neuron, NeuronInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";

const u64Max = 2n ** 64n - 1n;

export const updateVotingPowerRefreshedTimestamp = async ({
  seconds,
  neuron,
}: {
  seconds: bigint;
  neuron: NeuronInfo;
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
      votingPowerRefreshedTimestampSeconds: seconds,
    };

    await updateNeuron({
      neuron: newNeuron,
      identity,
    });

    await getAndLoadNeuron(neuron.neuronId);

    toastsSuccess({
      labelKey: "neuron_detail.update_neuron_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "error.update_neuron",
      err,
    });
  }
};

export const unlockNeuron = async (neuron: NeuronInfo): Promise<void> => {
  try {
    const identity = await getAuthenticatedIdentity();

    if (isNullish(neuron.fullNeuron)) {
      throw new Error(
        `Full neuron is not defined for neuron ${neuron.neuronId}`
      );
    }

    const newNeuron: Neuron = {
      ...neuron.fullNeuron,
      dissolveState: { WhenDissolvedTimestampSeconds: 0n },
      // Backend requirement: https://github.com/dfinity/ic/blob/a00685bd42a1d33e7c8c821b0216cb83f8e6f798/rs/nns/governance/src/neuron/types.rs#L1692
      agingSinceTimestampSeconds: u64Max,
    };

    await updateNeuron({
      neuron: newNeuron,
      identity,
    });

    await getAndLoadNeuron(neuron.neuronId);

    toastsSuccess({
      labelKey: "neuron_detail.unlock_neuron_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "error.unlock_neuron",
      err,
    });
  }
};

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
