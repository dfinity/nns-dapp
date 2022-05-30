import { writable } from "svelte/store";
import type { HardwareWalletNeuronsStore } from "../../lib/types/hardware-wallet-neurons.context";
import { mockFullNeuron, mockNeuron } from "./neurons.mock";

export const mockNeuronStake = {
  ...mockNeuron,
  neuronId: BigInt("123"),
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: BigInt(2_000_000_000),
  },
};

export const mockHardwareWalletNeuronsStore =
  writable<HardwareWalletNeuronsStore>({
    neurons: [
      {
        ...mockNeuron,
        controlledByNNSDapp: true,
      },
      {
        ...mockNeuronStake,
        controlledByNNSDapp: false,
      },
    ],
  });
