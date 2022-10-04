import type { HardwareWalletNeuronInfo } from "$lib/types/hardware-wallet-neurons.context";
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";
import { isHotKeyControllable } from "./neuron.utils";

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
