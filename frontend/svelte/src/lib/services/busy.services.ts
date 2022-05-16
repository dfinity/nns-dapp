import type { NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";
import { accountsStore } from "../stores/accounts.store";
import { startBusy, type BusyStateInitiatorType } from "../stores/busy.store";
import { i18n } from "../stores/i18n";
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
    startBusy(initiator);
    return;
  }
  const hardwareWalletNeuron = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: get(accountsStore),
  });
  const labels = get(i18n);
  startBusy(
    initiator,
    hardwareWalletNeuron ? labels.wallet.pending_approval : undefined
  );
};
