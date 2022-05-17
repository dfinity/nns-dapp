import { writable } from "svelte/store";
import type { HardwareWalletNeuronsStore } from "../../lib/types/hardware-wallet-neurons.context";
import { mockMainAccount } from "./accounts.store.mock";
import {mockFullNeuron, mockNeuron} from "./neurons.mock";

export const mockNeuronStake = {
  ...mockNeuron,
  neuronId: BigInt("123"),
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: BigInt(2_000_000_000),
  },
};

export const hardwareWalletNeuronsStore = writable<HardwareWalletNeuronsStore>({
  selectedAccount: mockMainAccount,
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
