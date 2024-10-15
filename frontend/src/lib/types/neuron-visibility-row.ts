export type VisibilityCellNeuronData = {
  neuronId: string;
  isPublic: boolean;
  tags: string[];
  uncontrolledNeuronDetails?: UncontrolledNeuronDetailsData;
};

export type UncontrolledNeuronDetailsData = {
  type: "hardwareWallet" | "hotkey";
  text: string;
};
