import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { nowInSeconds } from "./date.utils";
import { stateTextMapper, type StateInfo } from "./neuron.utils";

export type SnsNeuronState = NeuronState;

export const sortSnsNeuronsByCreatedTimestamp = (
  neurons: SnsNeuron[]
): SnsNeuron[] =>
  neurons.sort((a, b) =>
    Number(b.created_timestamp_seconds - a.created_timestamp_seconds)
  );

export const getSnsNeuronState = ({
  dissolve_state,
}: SnsNeuron): SnsNeuronState => {
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

export const getSnsDissolvingTimeInSeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const neuronState = getSnsNeuronState(neuron);
  const dissolveState = neuron.dissolve_state[0];
  console.log(
    "in da getSnsDissolvingTimeInSeconds",
    neuronState,
    dissolveState
  );
  if (
    neuronState === NeuronState.DISSOLVING &&
    dissolveState !== undefined &&
    "WhenDissolvedTimestampSeconds" in dissolveState
  ) {
    return dissolveState.WhenDissolvedTimestampSeconds - BigInt(nowInSeconds());
  }
};

export const getSnsLockedTimeInSeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const neuronState = getSnsNeuronState(neuron);
  const dissolveState = neuron.dissolve_state[0];
  if (
    neuronState === NeuronState.LOCKED &&
    dissolveState !== undefined &&
    "DissolveDelaySeconds" in dissolveState
  ) {
    console.log("returning something", dissolveState.DissolveDelaySeconds);
    return dissolveState.DissolveDelaySeconds - BigInt(nowInSeconds());
  }
};
