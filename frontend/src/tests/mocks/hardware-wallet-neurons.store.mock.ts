import type { WalletStore } from "$lib/types/wallet.context";
import { writable } from "svelte/store";
import { mockMainAccount } from "./accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "./neurons.mock";

export const mockNeuronStake = {
  ...mockNeuron,
  neuronId: BigInt("123"),
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: BigInt(2_000_000_000),
  },
};

export const mockHardwareWalletNeuronsStore = writable<WalletStore>({
  account: mockMainAccount,
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
