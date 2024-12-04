import type { TokenAmountV2 } from "@dfinity/utils";
import type { NeuronTagData } from "../utils/neuron.utils";

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
