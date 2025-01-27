import type { NeuronTagData } from "$lib/utils/neuron.utils";
import type { TokenAmountV2 } from "@dfinity/utils";

export type NeuronVisibilityRowData = {
  neuronId: string;
  isPublic: boolean;
  tags: NeuronTagData[];
  stake?: TokenAmountV2;
  uncontrolledNeuronDetails?: UncontrolledNeuronDetailsData;
};

export type UncontrolledNeuronDetailsData = {
  type: "hardwareWallet" | "hotkey";
  text: string;
};
