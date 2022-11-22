import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { formatToken } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { nowInSeconds } from "./date.utils";
import { enumValues } from "./enum.utils";
import { bytesToHexString, isNullish, nonNullish } from "./utils";

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
    return dissolveState.DissolveDelaySeconds === BigInt(0)
      ? // 0 = already dissolved (more info: https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/nns/governance/src/governance.rs#L827)
        NeuronState.Dissolved
      : NeuronState.Locked;
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

// Delay from now. Source depends on the neuron state.
export const getSnsDissolveDelaySeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const delay =
    getSnsDissolvingTimeInSeconds(neuron) ?? getSnsLockedTimeInSeconds(neuron);
  return delay;
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
  neurons?.find((neuron) => getSnsNeuronIdAsHexString(neuron) === neuronIdHex);

/**
 * Get the neuron id as string instead of its type
 * type Neuron {
 *   id: [] | [{ id: Uint8Array }],
 *   //...
 */
export const getSnsNeuronIdAsHexString = ({
  id: neuronId,
}: SnsNeuron): string =>
  subaccountToHexString(fromNullable(neuronId)?.id ?? new Uint8Array());

/**
 * Convert a subaccount to a hex string.
 * SnsNeuron id is a subaccount.
 *
 * @param {Uint8Array} subaccount
 * @returns {string} hex string
 */
export const subaccountToHexString = (subaccount: Uint8Array): string =>
  bytesToHexString(Array.from(subaccount));

export const canIdentityManageHotkeys = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean =>
  hasPermissions({
    neuron,
    identity,
    permissions: HOTKEY_PERMISSIONS,
  });

export const hasPermissionToDisburse = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean =>
  hasPermissions({
    neuron,
    identity,
    permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_DISBURSE],
  });

export const hasPermissionToDissolve = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean =>
  hasPermissions({
    neuron,
    identity,
    permissions: [
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_CONFIGURE_DISSOLVE_STATE,
    ],
  });

export const hasPermissionToVote = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean =>
  hasPermissions({
    neuron,
    identity,
    permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
  });

const hasAllPermissions = (permission_type: Int32Array): boolean => {
  const permissionsNumbers = Array.from(permission_type);
  const allPermissions = enumValues(SnsNeuronPermissionType);
  return (
    allPermissions.length === permissionsNumbers.length &&
    allPermissions.every((permission) =>
      permissionsNumbers.includes(permission)
    )
  );
};

/*
 * Returns true if the neuron contains provided permissions
 */
export const hasPermissions = ({
  neuron: { id, permissions: neuronPermissions },
  identity,
  permissions,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
  permissions: SnsNeuronPermissionType[];
}): boolean => {
  const neuronId = fromNullable(id);
  const principalAsText = identity?.getPrincipal().toText();

  if (isNullish(neuronId) || principalAsText === undefined) {
    return false;
  }

  const principalPermissions = Array.from(
    neuronPermissions.find(
      ({ principal }) => fromNullable(principal)?.toText() === principalAsText
    )?.permission_type ?? []
  );

  const notFound = (permission: SnsNeuronPermissionType) =>
    !principalPermissions.includes(permission);

  return !permissions.some(notFound);
};

export const getSnsNeuronHotkeys = ({ permissions }: SnsNeuron): string[] =>
  permissions
    // Filter the controller. The controller is the neuron with all permissions
    .filter(({ permission_type }) => !hasAllPermissions(permission_type))
    .filter(
      ({ permission_type }) =>
        HOTKEY_PERMISSIONS.find(
          (permission) => !permission_type.includes(permission)
        ) === undefined
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

/**
 * A type guard that performs a runtime check that the argument is a type SnsNeuron.
 * @param neuron
 */
export const isSnsNeuron = (
  neuron: SnsNeuron | NeuronInfo
): neuron is SnsNeuron =>
  Array.isArray((neuron as SnsNeuron).id) &&
  Array.isArray((neuron as SnsNeuron).permissions);

/**
 * Checks whether the neuron has either stake or maturity greater than zero.
 *
 * @param {SnsNeuron} neuron
 * @returns {boolean}
 */
export const hasValidStake = (neuron: SnsNeuron): boolean =>
  neuron.cached_neuron_stake_e8s + neuron.maturity_e8s_equivalent > BigInt(0);

/**
 * Format the maturity in a value (token "currency") way.
 * @param {SnsNeuron} neuron The neuron that contains the `maturityE8sEquivalent` formatted
 */
export const formattedSnsMaturity = (
  neuron: SnsNeuron | null | undefined
): string =>
  formatToken({
    value: neuron?.maturity_e8s_equivalent ?? BigInt(0),
  });

/**
 * Returns true if the neuron comes from a Community Fund investment.
 *
 * A CF neuron can be identified using the source_nns_neuron_id
 * which is the NNS neuron that joined the CF for the investment.
 *
 * @param {SnsNeuron} neuron
 * @returns {boolean}
 */
export const isCommunityFund = ({ source_nns_neuron_id }: SnsNeuron): boolean =>
  nonNullish(fromNullable(source_nns_neuron_id));

/**
 * Returns true if the neuron needs to be refreshed.
 * Refresh means to make a call to the backend to get the latest data.
 * A neuron needs to be refreshed if the balance of the subaccount doesn't match the stake.
 *
 * @param {Object}
 * @param {SnsNeuron} param.neuron neuron to check
 * @param {bigint} param.balanceE8s  subaccount balance
 * @returns
 */
export const needsRefresh = ({
  neuron,
  balanceE8s,
}: {
  neuron: SnsNeuron;
  balanceE8s: bigint;
}): boolean => balanceE8s !== neuron.cached_neuron_stake_e8s;

/**
 * Returns the functions that are available to follow.
 *
 * For now it filters out only the UNSPECIFIED function.
 * https://github.com/dfinity/ic/blob/5248f11c18ca564881bbb82a4eb6915efb7ca62f/rs/sns/governance/proto/ic_sns_governance/pb/v1/governance.proto#L582
 *
 */
const UNSPECIFIED_FUNCTION_ID = BigInt(0);
export const functionsToFollow = (
  functions: SnsNervousSystemFunction[] | undefined
): SnsNervousSystemFunction[] | undefined =>
  functions?.filter((f) => f.id !== UNSPECIFIED_FUNCTION_ID);
