import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { getNeuronFromStore } from "$lib/services/neurons.services";
import { startBusy, type BusyStateInitiatorType } from "$lib/stores/busy.store";
import { isNeuronControlledByHardwareWallet } from "$lib/utils/neuron.utils";
import type { NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";

export const startBusyNeuron = ({
  neuronId,
  initiator,
}: {
  neuronId: NeuronId;
  initiator: BusyStateInitiatorType;
}) => {
  const neuron = getNeuronFromStore(neuronId);
  if (neuron?.fullNeuron?.controller === undefined) {
    startBusy({ initiator });
    return;
  }
  const hardwareWalletNeuron = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: get(icpAccountsStore),
  });
  startBusy({
    initiator,
    ...(hardwareWalletNeuron && {
      labelKey: "busy_screen.pending_approval_hw",
    }),
  });
};
