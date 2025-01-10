import type { WalletStore } from "$lib/types/wallet.context";
import { writable } from "svelte/store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";

export const mockNeuronStake = {
  ...mockNeuron,
  neuronId: 123n,
  fullNeuron: {
    ...mockFullNeuron,
    cachedNeuronStake: 2_000_000_000n,
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
