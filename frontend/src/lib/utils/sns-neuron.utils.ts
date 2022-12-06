import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { votingPower } from "$lib/utils/neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SnsNeuronId } from "@dfinity/sns";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
import type {
  NervousSystemFunction,
  NervousSystemParameters,
} from "@dfinity/sns/dist/candid/sns_governance";
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
// https://gitlab.com/dfinity-lab/public/ic/-/blob/f6c4a37e2fd23ed83e6f7126ab0112a3a48cf54f/rs/sns/governance/src/neuron.rs#L428
export const getSnsDissolveDelaySeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const delay =
    getSnsDissolvingTimeInSeconds(neuron) ??
    getSnsLockedTimeInSeconds(neuron) ??
    0n;
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

export const hasPermissionToStakeMaturity = ({
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
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY,
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
 * Has the neuron the auto stake maturity feature turned on?
 * @param {SnsNeuron} neuron The neuron which potential has the feature on
 * @returns {boolean}
 */
export const hasAutoStakeMaturityOn = (
  neuron: SnsNeuron | null | undefined
): boolean =>
  (fromNullable(neuron?.auto_stake_maturity ?? []) ?? false) === true;

/**
 * Format the maturity in a value (token "currency") way.
 * @param {SnsNeuron} neuron The neuron that contains the `maturity_e8s_equivalent` that will be formatted
 */
export const formattedMaturity = (
  neuron: SnsNeuron | null | undefined
): string =>
  formatToken({
    value: neuron?.maturity_e8s_equivalent ?? BigInt(0),
  });

/**
 * Format the sum of the maturity in a value (token "currency") way.
 * @param {SnsNeuron} neuron The neuron that contains the `maturity_e8s_equivalent` and `staked_maturity_e8s_equivalent` which will be summed and formatted
 */
export const formattedTotalMaturity = (
  neuron: SnsNeuron | null | undefined
): string =>
  formatToken({
    value:
      (neuron?.maturity_e8s_equivalent ?? BigInt(0)) +
      (fromNullable(neuron?.staked_maturity_e8s_equivalent ?? []) ?? BigInt(0)),
  });

/**
 * Is the staked maturity of the neuron bigger than zero - i.e. has the neuron staked maturity?
 * @param {SnsNeuron} neuron
 */
export const hasEnoughMaturityToStake = (
  neuron: SnsNeuron | null | undefined
): boolean =>
  (fromNullable(neuron?.staked_maturity_e8s_equivalent ?? []) ?? BigInt(0)) >
  BigInt(0);

/**
 * Format the staked maturity in a value (token "currency") way.
 * @param {SnsNeuron} neuron The neuron that contains the `staked_maturity_e8s_equivalent` that will be formatted
 */
export const formattedStakedMaturity = (
  neuron: SnsNeuron | null | undefined
): string =>
  formatToken({
    value:
      fromNullable(neuron?.staked_maturity_e8s_equivalent ?? []) ?? BigInt(0),
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
 * Returns the followees of a neuron in a specific ns function.
 *
 * @param {Object} params
 * @param {SnsNeuron} params.neuron
 * @param {bigint} params.functionId
 * @returns {SnsNeuronId[]}
 */
export const followeesByFunction = ({
  neuron,
  functionId,
}: {
  neuron: SnsNeuron;
  functionId: bigint;
}): SnsNeuronId[] =>
  neuron.followees.reduce<SnsNeuronId[]>(
    (functionFollowees, [currentFunctionId, followeesData]) =>
      currentFunctionId === functionId
        ? followeesData.followees
        : functionFollowees,
    []
  );

export interface SnsFolloweesByNeuron {
  neuronIdHex: string;
  nsFunctions: NervousSystemFunction[];
}

/**
 * Returns a list of followees of a neuron.
 *
 * Each followee has then the list of ns functions that are followed.
 *
 * @param {Object} params
 * @param {SnsNeuron} params.neuron
 * @param {NervousSystemFunction[]} params.nsFunctions
 * @returns {SnsFolloweesByNeuron[]}
 */
export const followeesByNeuronId = ({
  neuron,
  nsFunctions,
}: {
  neuron: SnsNeuron;
  nsFunctions: NervousSystemFunction[];
}): SnsFolloweesByNeuron[] => {
  const followeesDictionary = neuron.followees.reduce<{
    [key: string]: NervousSystemFunction[];
  }>((acc, [functionId, followeesData]) => {
    const nsFunction = nsFunctions.find(({ id }) => id === functionId);
    // Edge case, all ns functions in followees should also be in the nervous system.
    if (nsFunction !== undefined) {
      for (const followee of followeesData.followees) {
        const followeeHex = subaccountToHexString(followee.id);
        if (acc[followeeHex]) {
          acc = {
            ...acc,
            [followeeHex]: [...acc[followeeHex], nsFunction],
          };
        } else {
          acc = {
            ...acc,
            [followeeHex]: [nsFunction],
          };
        }
      }
    }
    return acc;
  }, {});

  return Object.keys(followeesDictionary).map((neuronIdHex) => ({
    neuronIdHex,
    nsFunctions: followeesDictionary[neuronIdHex],
  }));
};

/**
 * Returns the sns neuron voting power
 * voting_power = neuron's_stake * dissolve_delay_bonus * age_bonus * voting_power_multiplier
 * The backend logic: https://gitlab.com/dfinity-lab/public/ic/-/blob/07ce9cef07535bab14d88f3f4602e1717be6387a/rs/sns/governance/src/neuron.rs#L158
 *
 * @param {SnsNeuron} neuron
 * @param {NervousSystemParameters} neuron.snsParameters
 * @param {number} neuron.newDissolveDelayInSeconds
 */
export const snsNeuronVotingPower = ({
  neuron,
  snsParameters,
  newDissolveDelayInSeconds,
}: {
  neuron: SnsNeuron;
  snsParameters: NervousSystemParameters;
  newDissolveDelayInSeconds?: bigint;
}): number => {
  const dissolveDelayInSeconds =
    newDissolveDelayInSeconds !== undefined
      ? newDissolveDelayInSeconds
      : getSnsDissolveDelaySeconds(neuron) ?? 0n;
  const nowSeconds = nowInSeconds();
  const {
    max_dissolve_delay_seconds,
    max_neuron_age_for_age_bonus,
    max_dissolve_delay_bonus_percentage,
    max_age_bonus_percentage,
    neuron_minimum_dissolve_delay_to_vote_seconds,
  } = snsParameters;
  const maxDissolveDelaySeconds = fromDefinedNullable(
    max_dissolve_delay_seconds
  );
  const maxNeuronAgeForAgeBonus = fromDefinedNullable(
    max_neuron_age_for_age_bonus
  );
  const maxDissolveDelayBonusPercentage = fromDefinedNullable(
    max_dissolve_delay_bonus_percentage
  );
  const maxAgeBonusPercentage = fromDefinedNullable(max_age_bonus_percentage);
  const neuronMinimumDissolveDelayToVoteSeconds = fromDefinedNullable(
    neuron_minimum_dissolve_delay_to_vote_seconds
  );

  // no voting power when less than minimum
  if (dissolveDelayInSeconds < neuronMinimumDissolveDelayToVoteSeconds) {
    return 0;
  }

  const {
    voting_power_percentage_multiplier,
    aging_since_timestamp_seconds,
    maturity_e8s_equivalent,
  } = neuron;
  const dissolveDelay =
    dissolveDelayInSeconds < maxDissolveDelaySeconds
      ? dissolveDelayInSeconds
      : maxDissolveDelaySeconds;
  const stakeE8s = BigInt(
    Math.max(Number(getSnsNeuronStake(neuron) + maturity_e8s_equivalent), 0)
  );
  const ageSeconds = BigInt(
    Math.max(nowSeconds - Number(aging_since_timestamp_seconds), 0)
  );
  const vp = Number(
    votingPower({
      stakeE8s,
      dissolveDelay,
      ageSeconds,
      ageBonusMultiplier: Number(maxAgeBonusPercentage) / 100,
      dissolveBonusMultiplier: Number(maxDissolveDelayBonusPercentage) / 100,
      maxDissolveDelaySeconds: Number(maxDissolveDelaySeconds),
      maxAgeSeconds: Number(maxNeuronAgeForAgeBonus),
      minDissolveDelaySeconds: Number(neuronMinimumDissolveDelayToVoteSeconds),
    })
  );

  // The voting power multiplier is applied against the total voting power of the neuron
  return vp * (Number(voting_power_percentage_multiplier) / 100);
};
