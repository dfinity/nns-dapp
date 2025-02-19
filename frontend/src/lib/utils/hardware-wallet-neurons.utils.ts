import type { HardwareWalletNeuronInfo } from "$lib/types/wallet.context";
import { isHotKeyControllable } from "$lib/utils/neuron.utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";

export const mapHardwareWalletNeuronInfo = ({
  identity,
  neuron,
}: {
  neuron: NeuronInfo;
  identity: Identity | null | undefined;
}): HardwareWalletNeuronInfo => ({
  ...neuron,
  controlledByNNSDapp: isHotKeyControllable({
    identity,
    neuron,
  }),
});
