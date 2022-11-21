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
export const getSnsDissolveDelaySeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const delay =
    getSnsDissolvingTimeInSeconds(neuron) ?? getSnsLockedTimeInSeconds(neuron);
  // TODO: review, is it a right place (https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/sns/governance/src/neuron.rs#L428)
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

// https://gitlab.com/dfinity-lab/public/ic/-/blob/master/rs/sns/governance/src/neuron.rs#L158
export const snsVotingPower = ({
  stake,
  dissolveDelayInSeconds,
  neuron,
  snsParameters,
}: {
  stake: number; // e8s
  dissolveDelayInSeconds: number;
  neuron: SnsNeuron;
  snsParameters: NervousSystemParameters;
}) => {
  console.log('')
  console.log('stake', stake)
  console.log('dissolveDelayInSeconds', dissolveDelayInSeconds)
  const now_seconds = nowInSeconds();
  // neuron
  const { aging_since_timestamp_seconds, voting_power_percentage_multiplier } =
    neuron;
  const agingSinceTimestampSeconds = Number(aging_since_timestamp_seconds);
  const votingPowerPercentageMultiplier = Number(
    voting_power_percentage_multiplier
  );
  console.log('votingPowerPercentageMultiplier', votingPowerPercentageMultiplier)
  console.log('agingSinceTimestampSeconds', agingSinceTimestampSeconds)
  // params
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

  // Dissolve delay is capped to max_dissolve_delay_seconds, but we cap it
  // again here to make sure, e.g., if this changes in the future.
  const dissolveDelay = Math.min(
    dissolveDelayInSeconds,
    maxDissolveDelaySeconds
  );

  console.log('dissolveDelay', dissolveDelay)
  // let d = std::cmp::min(
  //   self.dissolve_delay_seconds(now_seconds),
  //   max_dissolve_delay_seconds,
  // ) as u128;

  // 'd_stake' is the stake with bonus for dissolve delay.
  const stakeWithDissolveDelayBonus =
    stake + maxDissolveDelaySeconds > 0
      ? (stake * dissolveDelay * maxDissolveDelayBonusPercentage) /
        (100 * maxDissolveDelaySeconds)
      : 0;

  console.log('stakeWithDissolveDelayBonus', stakeWithDissolveDelayBonus)
  // Sanity check.
  // assert!(d_stake <= stake + (stake * (max_dissolve_delay_bonus_percentage as u128) / 100));

  // The voting power is also a function of the age of the
  // neuron, giving a bonus of up to max_age_bonus_percentage at max_neuron_age_for_age_bonus.
  // TODO: review because `aging_since_timestamp_seconds` is updated after the increaseDissolveDelay call
  const ageSeconds = Math.max(now_seconds - agingSinceTimestampSeconds, 0);

  console.log('ageSeconds', ageSeconds)
  const age = Math.min(ageSeconds, maxNeuronAgeForAgeBonus);
  console.log('age', age)
  const stakeWithDissolveDelayAndAgeBonus =
    stakeWithDissolveDelayBonus + maxNeuronAgeForAgeBonus > 0
      ? (stakeWithDissolveDelayBonus * age * maxAgeBonusPercentage) /
        (100 * maxNeuronAgeForAgeBonus)
      : 0;
  console.log('stakeWithDissolveDelayAndAgeBonus', stakeWithDissolveDelayAndAgeBonus)
  // Final stake 'ad_stake' has is not more than max_age_bonus_percentage above 'd_stake'.
  // assert!(ad_stake <= d_stake + (d_stake * (max_age_bonus_percentage) / 100));

  // Convert the multiplier to u128. The voting_power_percentage_multiplier represents
  // a percent and will always be within the range 0 to 100.
  // let v = self.voting_power_percentage_multiplier as u128;

  // Apply the multiplier to 'ad_stake' and divide by 100 to have the same effect as
  // multiplying by a percent.
  // let vad_stake = ad_stake
  //   .checked_mul(v)
  //   .expect("Overflow detected when calculating voting power")
  //   .checked_div(100)
  //   .expect("Underflow detected when calculating voting power");
  console.log('res',  (stakeWithDissolveDelayAndAgeBonus * votingPowerPercentageMultiplier) / 100)
  return (
    (stakeWithDissolveDelayAndAgeBonus * votingPowerPercentageMultiplier) / 100
  );

  // The final voting power is the stake adjusted by both age,
  // dissolve delay, and voting power multiplier. If the stake is greater than
  // u64::MAX divided by 2.5, the voting power may actually not
  // fit in a u64.
  // Math.min(vad_stake, u64::MAX as u128) as u64
};
