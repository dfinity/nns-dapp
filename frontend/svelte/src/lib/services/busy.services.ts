import type { NeuronId } from "@dfinity/nns";
import { startBusy, type BusyStateInitiatorType } from "../stores/busy.store";
import { getNeuronFromStore } from "./neurons.services";

export const startBusyNeuron = ({
  neuronId,
  initiator,
}: {
  neuronId: NeuronId;
  initiator: BusyStateInitiatorType;
}) => {
  const neuron = getNeuronFromStore(neuronId);
  // Check if neuron is controlled by hardware wallet
  startBusy(initiator);
};
