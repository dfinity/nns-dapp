import type { HardwareWalletNeuronInfo } from "$lib/types/wallet.context";
import { isHotKeyControllable } from "$lib/utils/neuron.utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import type { Identity } from "@icp-sdk/core/agent";

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
