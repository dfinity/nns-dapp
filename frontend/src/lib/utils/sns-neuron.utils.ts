import type { Identity } from "@dfinity/agent";
import { NeuronState } from "@dfinity/nns";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { AppPath } from "../constants/routes.constants";
import {
  getLastPathDetail,
  getParentPathDetail,
  isRoutePath,
} from "./app-path.utils";
import { nowInSeconds } from "./date.utils";
import { enumValues } from "./enum.utils";
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

// For now, both nns neurons and sns neurons have the same states.
export const getSnsNeuronState = ({
  dissolve_state,
}: SnsNeuron): NeuronState => {
  const dissolveState = fromNullable(dissolve_state);
  if (dissolveState === undefined) {
    return NeuronState.Dissolved;
  }
  if ("DissolveDelaySeconds" in dissolveState) {
    return NeuronState.Locked;
  }
  if ("WhenDissolvedTimestampSeconds" in dissolveState) {
    return NeuronState.Dissolving;
  }
  return NeuronState.Unspecified;
};

export const getSnsDissolvingTimeInSeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const neuronState = getSnsNeuronState(neuron);
  const dissolveState = fromNullable(neuron.dissolve_state);
  if (
    neuronState === NeuronState.Dissolving &&
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
  const dissolveState = fromNullable(neuron.dissolve_state);
  if (
    neuronState === NeuronState.Locked &&
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
  bytesToHexString(fromNullable(neuron.id)?.id ?? []);

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
  neuron: { id, permissions },
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean => {
  const neuronId = fromNullable(id);
  if (neuronId === undefined || identity === undefined || identity === null) {
    return false;
  }
  const principalPermission = permissions.find(
    ({ principal }) =>
      fromNullable(principal)?.toText() === identity.getPrincipal().toText()
  );
  return (
    principalPermission?.permission_type.includes(
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE
    ) ?? false
  );
};

const hasAllPermissions = (permissions: SnsNeuronPermissionType[]): boolean => {
  const allPermissions = enumValues(SnsNeuronPermissionType);
  return (
    allPermissions.length === permissions.length &&
    allPermissions.every((permission) => permissions.includes(permission))
  );
};

export const getSnsNeuronHotkeys = ({ permissions }: SnsNeuron): string[] =>
  permissions
    // Filter the controller. The controller is the neuron with all permissions
    .filter(({ permission_type }) => !hasAllPermissions(permission_type))
    .filter(({ permission_type }) =>
      permission_type.includes(
        SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE
      )
    )
    .map(({ principal }) => fromNullable(principal)?.toText())
    .filter(nonNullish);

export const isUserHotkey = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | null | undefined;
}) =>
  identity === null || identity === undefined
    ? false
    : getSnsNeuronHotkeys(neuron).includes(identity.getPrincipal().toText());
