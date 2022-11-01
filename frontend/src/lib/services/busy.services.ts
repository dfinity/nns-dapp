import { accountsStore } from "$lib/stores/accounts.store";
import { i18n } from "$lib/stores/i18n";
import type { BusyStateInitiatorType } from "$lib/types/busy-state";
import { isNeuronControlledByHardwareWallet } from "$lib/utils/neuron.utils";
import { startBusy } from "@dfinity/gix-components";
import type { NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";
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
      text: get(i18n).busy_screen.pending_approval_hw,
    }),
  });
};
