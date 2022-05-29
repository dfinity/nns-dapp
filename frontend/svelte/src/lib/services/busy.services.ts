import type { NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";
import { accountsStore } from "../stores/accounts.store";
import { startBusy, type BusyStateInitiatorType } from "../stores/busy.store";
import { isNeuronControlledByHardwareWallet } from "../utils/neuron.utils";
import { getNeuronFromStore } from "./neurons.services";

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
    accounts: get(accountsStore),
  });
  startBusy({
    initiator,
    ...(hardwareWalletNeuron && {
      labelKey: "busy_screen.pending_approval_hw",
    }),
  });
};
