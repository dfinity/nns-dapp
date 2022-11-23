import { formatToken } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
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
// https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/sns/governance/src/neuron.rs#L428
export const getSnsDissolveDelaySeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const delay =
    getSnsDissolvingTimeInSeconds(neuron) ?? getSnsLockedTimeInSeconds(neuron) ?? 0n;
  return delay > 0n ? delay : 0n;
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
    permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
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
        [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ].find((permission) => !permission_type.includes(permission)) ===
        undefined
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

// https://gitlab.com/dfinity-lab/public/ic/-/blob/07ce9cef07535bab14d88f3f4602e1717be6387a/rs/sns/governance/src/neuron.rs#L158
export const snsVotingPower = ({
  nowSeconds,
  dissolveDelayInSeconds,
  neuron,
  snsParameters,
}: {
  nowSeconds: number;
  dissolveDelayInSeconds: number;
  neuron: SnsNeuron;
  snsParameters: NervousSystemParameters;
}) => {
  const {
    voting_power_percentage_multiplier,
    neuron_fees_e8s,
    dissolve_state,
  } = neuron;
  const votingPowerPercentageMultiplier = Number(
    voting_power_percentage_multiplier
  );

  // We don't use value of `aging_since_timestamp_seconds` because the increase dissolve delay backend function updates it.
  // To get the voting power after increase dissolve delay call we update calculate the `aging_since_timestamp_seconds` according the backend logic.
  // https://gitlab.com/dfinity-lab/public/ic/-/blob/07ce9cef07535bab14d88f3f4602e1717be6387a/rs/sns/governance/src/neuron.rs#L302
  let agingSinceTimestampSeconds: number;
  const dissolveState = fromDefinedNullable(dissolve_state);
  if ("DissolveDelaySeconds" in dissolveState) {
    if (dissolveState.DissolveDelaySeconds === 0n) {
      // We transition from `Dissolved` to `NotDissolving`: reset age.
      agingSinceTimestampSeconds = nowSeconds;
    }
  } else if ("WhenDissolvedTimestampSeconds" in dissolveState) {
    const whenDissolved = Number(dissolveState.WhenDissolvedTimestampSeconds);
    agingSinceTimestampSeconds = whenDissolved > nowSeconds ? Number.MAX_SAFE_INTEGER : whenDissolved;
  } else {
    agingSinceTimestampSeconds = nowSeconds;
  }

  const {
    max_dissolve_delay_seconds,
    max_neuron_age_for_age_bonus,
    max_dissolve_delay_bonus_percentage,
    max_age_bonus_percentage,
  } = snsParameters;
  const maxDissolveDelaySeconds = Number(
    fromDefinedNullable(max_dissolve_delay_seconds)
  );
  const maxNeuronAgeForAgeBonus = Number(
    fromDefinedNullable(max_neuron_age_for_age_bonus)
  );
  const maxDissolveDelayBonusPercentage = Number(
    fromDefinedNullable(max_dissolve_delay_bonus_percentage)
  );
  const maxAgeBonusPercentage = Number(
    fromDefinedNullable(max_age_bonus_percentage)
  );
  const dissolveDelay = Math.min(
    dissolveDelayInSeconds,
    maxDissolveDelaySeconds
  );
  const stake = Math.max(
    Number(getSnsNeuronStake(neuron) - neuron_fees_e8s),
    0
  );
  const dissolveDelayBonus =
    maxDissolveDelaySeconds > 0
      ? (stake * dissolveDelay * maxDissolveDelayBonusPercentage) /
        (100 * maxDissolveDelaySeconds)
      : 0;
  const stakeWithDissolveDelayBonus = stake + dissolveDelayBonus;
  const ageSeconds = Math.max(nowSeconds - agingSinceTimestampSeconds, 0);
  const age = Math.min(ageSeconds, maxNeuronAgeForAgeBonus);
  const stakeWithAgeBonus =
    maxNeuronAgeForAgeBonus > 0
      ? (stakeWithDissolveDelayBonus * age * maxAgeBonusPercentage) /
        (100 * maxNeuronAgeForAgeBonus)
      : 0;
  const stakeWithAllBonuses = stakeWithDissolveDelayBonus + stakeWithAgeBonus;
  return (stakeWithAllBonuses * votingPowerPercentageMultiplier) / 100;
};
