import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import type { SnsNeuronState } from "../types/sns";
import { nowInSeconds } from "./date.utils";
import { stateTextMapper, type StateInfo } from "./neuron.utils";

export const sortSnsNeuronsByCreatedTimestamp = (
  neurons: SnsNeuron[]
): SnsNeuron[] =>
  [...neurons].sort(
    (
      { created_timestamp_seconds: created1 },
      { created_timestamp_seconds: created2 }
    ) => Number(created2 - created1)
  );

export const getSnsNeuronState = ({
  dissolve_state,
}: SnsNeuron): SnsNeuronState => {
  // TODO: use upcoming fromDefinedNullable
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
  // TODO: use upcoming fromDefinedNullable
  const dissolveState = neuron.dissolve_state[0];
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
  // TODO: use upcoming fromDefinedNullable
  const dissolveState = neuron.dissolve_state[0];
  if (
    neuronState === NeuronState.LOCKED &&
    dissolveState !== undefined &&
    "DissolveDelaySeconds" in dissolveState
  ) {
    return dissolveState.DissolveDelaySeconds - BigInt(nowInSeconds());
  }
};

export const getSnsNeuronStake = ({
  cached_neuron_stake_e8s,
  neuron_fees_e8s,
}: SnsNeuron): bigint => cached_neuron_stake_e8s - neuron_fees_e8s;

/**
 * Get the neuron id as string instead of its type
 * type Neuron {
 *   id: { id: number[] },
 *   //...
 */
export const getSnsNeuronId = (neuron: SnsNeuron): string =>
  // TODO: use upcoming fromDefinedNullable
  neuron.id[0]?.id.join("") ?? "";
