import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";
import type { HardwareWalletNeuronInfo } from "../types/hardware-wallet-neurons.context";
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
