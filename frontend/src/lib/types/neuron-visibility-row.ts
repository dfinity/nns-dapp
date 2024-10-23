import type { TokenAmountV2 } from "@dfinity/utils";

export type NeuronVisibilityRowData = {
  neuronId: string;
  isPublic: boolean;
  tags: string[];
  stake?: TokenAmountV2;
  uncontrolledNeuronDetails?: UncontrolledNeuronDetailsData;
};

export type UncontrolledNeuronDetailsData = {
  type: "hardwareWallet" | "hotkey";
  text: string;
};
