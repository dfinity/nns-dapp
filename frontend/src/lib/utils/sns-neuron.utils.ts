import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { stateTextMapper, type StateInfo } from "./neuron.utils";

export type SnsNeuronState = NeuronState;

export const sortSnsNeuronsByCreatedTimestamp = (
  neurons: SnsNeuron[]
): SnsNeuron[] =>
  neurons.sort((a, b) =>
    Number(b.created_timestamp_seconds - a.created_timestamp_seconds)
  );

const getSnsNeuronState = ({ dissolve_state }: SnsNeuron): SnsNeuronState => {
  const dissolveState = dissolve_state[0];
  if (dissolveState === undefined) {
    return NeuronState.DISSOLVED;
  }
  if ("DissolveDelaySeconds" in dissolveState) {
    return NeuronState.LOCKED;
  }
  if ("WhenDissolvedTimestampSeconds" in dissolveState) {
    return NeuronState.DISSOLVING;
  }
  return NeuronState.UNSPECIFIED;
};

export const getSnsStateInfo = (neuron: SnsNeuron): StateInfo => {
  const state = getSnsNeuronState(neuron);
  return stateTextMapper[state] ?? stateTextMapper[NeuronState.UNSPECIFIED];
};
