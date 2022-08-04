import type { Identity } from "@dfinity/agent";
import { NeuronState } from "@dfinity/nns";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { AppPath } from "../constants/routes.constants";
import type { SnsNeuronState } from "../types/sns";
import {
  getLastPathDetail,
  getParentPathDetail,
  isRoutePath,
} from "./app-path.utils";
import { nowInSeconds } from "./date.utils";
import { fromNullable } from "./did.utils";
import { stateTextMapper, type StateInfo } from "./neuron.utils";
import { bytesToHexString, nonNullish } from "./utils";

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
    return dissolveState.DissolveDelaySeconds;
  }
};

export const getSnsNeuronStake = ({
  cached_neuron_stake_e8s,
  neuron_fees_e8s,
}: SnsNeuron): bigint => cached_neuron_stake_e8s - neuron_fees_e8s;

export const getSnsNeuronByHexId = ({
  neuronIdHex,
  neurons,
}: {
  neuronIdHex: string;
  neurons: SnsNeuron[] | undefined;
}): SnsNeuron | undefined =>
  neurons?.find(({ id }) => bytesToHexString(id[0]?.id ?? []) === neuronIdHex);

/**
 * Get the neuron id as string instead of its type
 * type Neuron {
 *   id: { id: number[] },
 *   //...
 */
export const getSnsNeuronIdAsHexString = (neuron: SnsNeuron): string =>
  // TODO: use upcoming fromDefinedNullable
  bytesToHexString(neuron.id[0]?.id ?? []);

export const routePathSnsNeuronId = (path: string): string | undefined => {
  if (!isRoutePath({ path: AppPath.SnsNeuronDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
};

export const routePathSnsNeuronRootCanisterId = (
  path: string
): string | undefined => {
  if (!isRoutePath({ path: AppPath.SnsNeuronDetail, routePath: path })) {
    return undefined;
  }
  return getParentPathDetail(path);
};

export const canIdentityManageHotkeys = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean => {
  const neuronId = fromNullable(neuron.id);
  if (neuronId === undefined || identity === undefined || identity === null) {
    return false;
  }
  const principalPermission = neuron.permissions.find(
    ({ principal }) =>
      fromNullable(principal)?.toText() === identity.getPrincipal().toText()
  );
  return (
    principalPermission?.permission_type.includes(
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE
    ) ?? false
  );
};

export const getSnsNeuronHotkeys = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | null | undefined;
}): string[] =>
  neuron.permissions
    .filter(({ permission_type }) =>
      permission_type.includes(
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE
      )
    )
    .map(({ principal }) => fromNullable(principal)?.toText())
    .filter(nonNullish)
    .filter((principal) => principal !== identity?.getPrincipal().toText());
