import {
  HOTKEY_PERMISSIONS,
  MANAGE_HOTKEY_PERMISSIONS,
  MAX_NEURONS_SUBACCOUNTS,
} from "$lib/constants/sns-neurons.constants";
import { NextMemoNotFoundError } from "$lib/types/sns-neurons.errors";
import {
  bonusMultiplier,
  votingPower,
  type CompactNeuronInfo,
  type IneligibleNeuronData,
  type NeuronIneligibilityReason,
} from "$lib/utils/neuron.utils";
import { mapNervousSystemParameters } from "$lib/utils/sns-parameters.utils";
import { formatToken } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import { NeuronState, Vote, type E8s, type NeuronInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuronId } from "@dfinity/sns";
import {
  SnsNeuronPermissionType,
  SnsVote,
  neuronSubaccount,
  type SnsNervousSystemFunction,
  type SnsNervousSystemParameters,
  type SnsNeuron,
  type SnsProposalData,
} from "@dfinity/sns";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { nowInSeconds } from "./date.utils";
import { ballotVotingPower } from "./sns-proposals.utils";
import { bytesToHexString } from "./utils";

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
    // In case `nowInSeconds` ever changes and doesn't return an integer we use Math.floor
    return dissolveState.WhenDissolvedTimestampSeconds <
      BigInt(Math.floor(nowInSeconds()))
      ? NeuronState.Dissolved
      : NeuronState.Dissolving;
  }
  return NeuronState.Unspecified;
};

export const getSnsDissolvingTimestampSeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const neuronState = getSnsNeuronState(neuron);
  const dissolveState = fromNullable(neuron.dissolve_state);
  if (
    neuronState === NeuronState.Dissolving &&
    dissolveState !== undefined &&
    "WhenDissolvedTimestampSeconds" in dissolveState
  ) {
    return dissolveState.WhenDissolvedTimestampSeconds;
  }
};

export const getSnsDissolvingTimeInSeconds = (
  neuron: SnsNeuron
): bigint | undefined => {
  const dissolvingTimestamp = getSnsDissolvingTimestampSeconds(neuron);
  return nonNullish(dissolvingTimestamp)
    ? dissolvingTimestamp - BigInt(nowInSeconds())
    : undefined;
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

/**
 * Find the first not existed memo (index based).
 * This approach works because sns neurons are not deleted.
 *
 * @param {Object} params
 * @param {Identity} params.identity
 * @param {SnsNeuron[]} params.neurons
 */
export const nextMemo = ({
  identity,
  neurons,
}: {
  identity: Identity;
  neurons: SnsNeuron[];
}): bigint => {
  const controller = identity.getPrincipal();
  for (let index = 0; index < MAX_NEURONS_SUBACCOUNTS; index++) {
    const subaccount = neuronSubaccount({
      controller,
      index,
    });
    if (
      getSnsNeuronByHexId({
        neuronIdHex: subaccountToHexString(subaccount),
        neurons,
      }) === undefined
    ) {
      return BigInt(index);
    }
  }

  throw new NextMemoNotFoundError();
};

/**
 * Users are able to manage hotkeys when both:
 * - User’s principal has the `ManageVotingPermission` or `ManagePrincipals` permission.
 * - Both `Vote` and `SubmitProposal` are in `neuron_grantable_permissions` parameter
 *
 * @param {Object} params
 * @param {SnsNeuron} params.neuron
 * @param {Identity | undefined | null} params.identity
 * @param {SnsNervousSystemParameters} params.parameters
 */
export const canIdentityManageHotkeys = ({
  neuron,
  identity,
  parameters,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
  parameters: SnsNervousSystemParameters;
}): boolean => {
  const { neuron_grantable_permissions } =
    mapNervousSystemParameters(parameters);
  const grantableSet = new Set(neuron_grantable_permissions);
  const hotkeyPermissionsGrantable = HOTKEY_PERMISSIONS.every((permission) =>
    grantableSet.has(permission)
  );
  const identityAllowedToManageHotkeys = hasPermissions({
    neuron,
    identity,
    permissions: MANAGE_HOTKEY_PERMISSIONS,
    options: { anyPermission: true },
  });
  return identityAllowedToManageHotkeys && hotkeyPermissionsGrantable;
};

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

export const hasPermissionToSplit = ({
  neuron,
  identity,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
}): boolean =>
  hasPermissions({
    neuron,
    identity,
    permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT],
  });

/**
 * Returns true if the neuron contains provided permissions
 * By default neuron should have all of `permissions`. This can be changed w/ `options.any` flag.
 *
 * @param {Object} param
 * @param {SnsNeuron} param.neuron
 * @param {Identity | undefined | null} param.identity
 * @param {SnsNeuronPermissionType[]} param.permissions
 * @param {Object} param.options Additional options
 * @param {boolean} param.options.any At least one of provided permissions should be in principals list
 */
export const hasPermissions = ({
  neuron: { id, permissions: neuronPermissions },
  identity,
  permissions,
  options,
}: {
  neuron: SnsNeuron;
  identity: Identity | undefined | null;
  permissions: SnsNeuronPermissionType[];
  options?: { anyPermission: boolean };
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

  if (options?.anyPermission) {
    return Boolean(
      permissions.find((permission: SnsNeuronPermissionType) =>
        principalPermissions.includes(permission)
      )
    );
  }

  const notFound = (permission: SnsNeuronPermissionType) =>
    !principalPermissions.includes(permission);
  return !permissions.some(notFound);
};

const comparePermissions = ({
  a,
  b,
}: {
  a: SnsNeuronPermissionType[];
  b: SnsNeuronPermissionType[];
}): boolean => {
  const bSet = new Set(b);
  return a.length === b.length && a.every((permission) => bSet.has(permission));
};

/**
 * Returns the principals that have ONLY the hotkey permissions:
 * - Both `Vote` and `SubmitProposal`
 * - `ManageVotingPermission` or/and `ManagePrincipals`
 *
 * If a neuron has more than those permission combinations, it is not a hotkey.
 *
 * @param {SnsNeuron}
 * @returns {string[]} principals that are hotkeys
 */
export const getSnsNeuronHotkeys = ({ permissions }: SnsNeuron): string[] => {
  // only those combinations define a hotkey
  const hotkeyPermissions = [
    HOTKEY_PERMISSIONS,
    // for CF neuron as an exception
    [
      ...HOTKEY_PERMISSIONS,
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION,
    ],
  ];
  return permissions
    .filter(({ permission_type }) => {
      const neuronPermissions = Array.from(permission_type);
      return (
        hotkeyPermissions.find((aHotkeyPermissions) =>
          comparePermissions({
            a: neuronPermissions,
            b: aHotkeyPermissions,
          })
        ) !== undefined
      );
    })
    .map(({ principal }) => fromNullable(principal)?.toText())
    .filter(nonNullish);
};

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

/*
- The amount to split minus the transfer fee is more than the minimum stake (thus the child neuron will have at least the minimum stake)
- The parent's stake minus amount to split is more than the minimum stake (thus the parent neuron will have at least the minimum stake)
 */
export const minNeuronSplittable = ({
  fee,
  neuronMinimumStake,
}: {
  fee: E8s;
  neuronMinimumStake: E8s;
}): bigint => 2n * neuronMinimumStake + fee;

export const isEnoughAmountToSplit = ({
  amount,
  fee,
  neuronMinimumStake,
}: {
  amount: E8s;
  fee: E8s;
  neuronMinimumStake: E8s;
}): boolean => amount >= neuronMinimumStake + fee;

export const hasEnoughStakeToSplit = ({
  neuron,
  fee,
  neuronMinimumStake,
}: {
  neuron: SnsNeuron;
  fee: E8s;
  neuronMinimumStake: E8s;
}): boolean =>
  getSnsNeuronStake(neuron) >= minNeuronSplittable({ fee, neuronMinimumStake });

/**
 * Has the neuron the auto stake maturity feature turned on?
 * @param {SnsNeuron} neuron The neuron which potential has the feature on
 * @returns {boolean}
 */
export const hasAutoStakeMaturityOn = (
  neuron: SnsNeuron | null | undefined
): boolean => Boolean(fromNullable(neuron?.auto_stake_maturity ?? []));

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
 * Is the maturity of the neuron bigger than zero - i.e. has the neuron staked maturity?
 * @param {SnsNeuron} neuron
 */
export const hasEnoughMaturityToStake = (
  neuron: SnsNeuron | null | undefined
): boolean => (neuron?.maturity_e8s_equivalent ?? BigInt(0)) > BigInt(0);

/**
 * Does the neuron has staked maturity?
 * @param neuron
 */
export const hasStakedMaturity = (
  neuron: SnsNeuron | null | undefined
): boolean =>
  nonNullish(fromNullable(neuron?.staked_maturity_e8s_equivalent ?? []));

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
  nsFunctions: SnsNervousSystemFunction[];
}

/**
 * Returns a list of followees of a neuron.
 *
 * Each followee has then the list of ns functions that are followed.
 *
 * @param {Object} params
 * @param {SnsNeuron} params.neuron
 * @param {SnsNervousSystemFunction[]} params.nsFunctions
 * @returns {SnsFolloweesByNeuron[]}
 */
export const followeesByNeuronId = ({
  neuron,
  nsFunctions,
}: {
  neuron: SnsNeuron;
  nsFunctions: SnsNervousSystemFunction[];
}): SnsFolloweesByNeuron[] => {
  const followeesDictionary = neuron.followees.reduce<{
    [key: string]: SnsNervousSystemFunction[];
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
 * Returns the neuron's age
 *
 * Backend logic: https://gitlab.com/dfinity-lab/public/ic/-/blob/07ce9cef07535bab14d88f3f4602e1717be6387a/rs/sns/governance/src/neuron.rs#L415
 * @param {SnsNeuron} neuron
 * @returns {bigint}
 */
export const neuronAge = ({
  aging_since_timestamp_seconds,
}: SnsNeuron): bigint =>
  BigInt(Math.max(nowInSeconds() - Number(aging_since_timestamp_seconds), 0));

/**
 * Returns the sns neuron voting power
 * voting_power = neuron's_stake * dissolve_delay_bonus * age_bonus * voting_power_multiplier
 * The backend logic: https://gitlab.com/dfinity-lab/public/ic/-/blob/07ce9cef07535bab14d88f3f4602e1717be6387a/rs/sns/governance/src/neuron.rs#L158
 *
 * Returns 0 if the neuron is not eligible to vote.
 *
 * @param {SnsNeuron} neuron
 * @param {SnsNervousSystemParameters} neuron.snsParameters
 * @param {number} neuron.newDissolveDelayInSeconds
 */
export const snsNeuronVotingPower = ({
  neuron,
  snsParameters,
  newDissolveDelayInSeconds,
}: {
  neuron: SnsNeuron;
  snsParameters: SnsNervousSystemParameters;
  newDissolveDelayInSeconds?: bigint;
}): number => {
  const dissolveDelayInSeconds =
    newDissolveDelayInSeconds !== undefined
      ? newDissolveDelayInSeconds
      : getSnsDissolveDelaySeconds(neuron) ?? 0n;
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

  const { voting_power_percentage_multiplier, staked_maturity_e8s_equivalent } =
    neuron;
  const dissolveDelay =
    dissolveDelayInSeconds < maxDissolveDelaySeconds
      ? dissolveDelayInSeconds
      : maxDissolveDelaySeconds;
  const stakeE8s = BigInt(
    Math.max(
      Number(
        getSnsNeuronStake(neuron) +
          (fromNullable(staked_maturity_e8s_equivalent) ?? BigInt(0))
      ),
      0
    )
  );

  const vp = Number(
    votingPower({
      stakeE8s,
      dissolveDelay,
      ageSeconds: neuronAge(neuron),
      ageBonusMultiplier: Number(maxAgeBonusPercentage) / 100,
      dissolveBonusMultiplier: Number(maxDissolveDelayBonusPercentage) / 100,
      maxDissolveDelaySeconds: Number(maxDissolveDelaySeconds),
      maxAgeSeconds: Number(maxNeuronAgeForAgeBonus),
      minDissolveDelaySeconds: Number(neuronMinimumDissolveDelayToVoteSeconds),
    })
  );

  // The voting power multiplier is applied against the total voting power of the neuron
  // Rounding to avoid RangeError when converting to BigInt
  // (voting power is similar to e8s therefore rounding should not decrease accuracy)
  return Math.round(vp * (Number(voting_power_percentage_multiplier) / 100));
};

export const dissolveDelayMultiplier = ({
  neuron,
  snsParameters: {
    neuron_minimum_dissolve_delay_to_vote_seconds,
    max_dissolve_delay_seconds,
    max_dissolve_delay_bonus_percentage,
  },
}: {
  neuron: SnsNeuron;
  snsParameters: SnsNervousSystemParameters;
}): number => {
  const neuronMinimumDissolveDelayToVoteSeconds = fromDefinedNullable(
    neuron_minimum_dissolve_delay_to_vote_seconds
  );
  const maxDissolveDelaySeconds = fromDefinedNullable(
    max_dissolve_delay_seconds
  );
  const maxDissolveDelayBonusPercentage = fromDefinedNullable(
    max_dissolve_delay_bonus_percentage
  );
  const dissolveDelayInSeconds = getSnsDissolveDelaySeconds(neuron) ?? 0n;
  const dissolveDelay =
    dissolveDelayInSeconds < maxDissolveDelaySeconds
      ? dissolveDelayInSeconds
      : maxDissolveDelaySeconds;

  if (dissolveDelay < neuronMinimumDissolveDelayToVoteSeconds) {
    return 0;
  }

  return bonusMultiplier({
    amount: dissolveDelay,
    multiplier: Number(maxDissolveDelayBonusPercentage) / 100,
    max: Number(maxDissolveDelaySeconds),
  });
};

export const ageMultiplier = ({
  neuron,
  snsParameters: { max_neuron_age_for_age_bonus, max_age_bonus_percentage },
}: {
  neuron: SnsNeuron;
  snsParameters: SnsNervousSystemParameters;
}): number => {
  const maxAgeBonusPercentage = fromDefinedNullable(max_age_bonus_percentage);
  const maxNeuronAgeForAgeBonus = fromDefinedNullable(
    max_neuron_age_for_age_bonus
  );

  return bonusMultiplier({
    amount: neuronAge(neuron),
    multiplier: Number(maxAgeBonusPercentage) / 100,
    max: Number(maxNeuronAgeForAgeBonus),
  });
};

/** Returns the reason or undefined when the neuron is eligible to vote. */
export const snsNeuronsIneligibilityReasons = ({
  neuron,
  proposal,
  identity,
}: {
  neuron: SnsNeuron;
  proposal: SnsProposalData;
  identity: Identity;
}): NeuronIneligibilityReason | undefined => {
  const { ballots, proposal_creation_timestamp_seconds } = proposal;
  const neuronId = getSnsNeuronIdAsHexString(neuron);

  if (neuron.created_timestamp_seconds > proposal_creation_timestamp_seconds) {
    return "since";
  }

  if (!hasPermissionToVote({ neuron, identity })) {
    return "no-permission";
  }

  const noBallot: boolean =
    ballots.find(([ballotNeuronId]) => ballotNeuronId === neuronId) ===
    undefined;
  if (noBallot) {
    return "short";
  }

  return undefined;
};

export const ineligibleSnsNeurons = ({
  neurons,
  proposal,
  identity,
}: {
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  identity: Identity;
}): SnsNeuron[] =>
  neurons.filter(
    (neuron) =>
      snsNeuronsIneligibilityReasons({
        neuron,
        proposal,
        identity,
      }) !== undefined
  );

export const votableSnsNeurons = ({
  neurons,
  proposal,
  identity,
}: {
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  identity: Identity;
}): SnsNeuron[] => {
  return neurons.filter((neuron) => {
    const ineligibleReason = snsNeuronsIneligibilityReasons({
      neuron,
      proposal,
      identity,
    });
    const vote: SnsVote | undefined = proposal.ballots
      .filter(
        ([ballotNeuronId]) =>
          getSnsNeuronIdAsHexString(neuron) === ballotNeuronId
      )
      .map(([, { vote }]) => vote)?.[0];

    return ineligibleReason === undefined && vote === SnsVote.Unspecified;
  });
};

/** Returns the neurons that have voted on the proposal (based on proposal ballots) */
export const votedSnsNeurons = ({
  neurons,
  proposal,
}: {
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
}): SnsNeuron[] => {
  const votedNeuronIds = new Set(
    proposal.ballots
      // filter out the unspecified votes or the ballots that are not presented in ballots
      .filter(([, { vote }]) => vote === Vote.Yes || vote === Vote.No)
      .map(([neuronId]) => neuronId)
  );
  return neurons.filter((neuron) =>
    votedNeuronIds.has(getSnsNeuronIdAsHexString(neuron))
  );
};

export const votedSnsNeuronDetails = ({
  neurons,
  proposal,
}: {
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
}): CompactNeuronInfo[] =>
  votedSnsNeurons({
    neurons,
    proposal,
  })
    .map((neuron) => ({
      idString: getSnsNeuronIdAsHexString(neuron),
      votingPower: ballotVotingPower({ proposal, neuron }),
      vote: getSnsNeuronVote({ neuron, proposal }),
    }))
    // Exclude the cases where the vote was not found.
    .filter(({ vote }) => vote !== undefined) as CompactNeuronInfo[];

/** Returns neuron vote using proposal ballots. */
export const getSnsNeuronVote = ({
  neuron,
  proposal,
}: {
  neuron: SnsNeuron;
  proposal: SnsProposalData;
}): Vote | undefined =>
  proposal.ballots.find(
    ([ballotNeuronId]) => ballotNeuronId === getSnsNeuronIdAsHexString(neuron)
  )?.[1].vote;

export const snsNeuronsToIneligibleNeuronData = ({
  neurons,
  proposal,
  identity,
}: {
  neurons: SnsNeuron[];
  proposal: SnsProposalData;
  identity: Identity;
}): IneligibleNeuronData[] =>
  neurons.map((neuron) => ({
    neuronIdString: getSnsNeuronIdAsHexString(neuron),
    reason: snsNeuronsIneligibilityReasons({
      neuron,
      proposal,
      identity,
    }),
  }));

/**
 * Returns how long until the vesting period ends in seconds.
 *
 * If the vesting period has ended, returns 0.
 */
export const vestingInSeconds = ({
  created_timestamp_seconds,
  vesting_period_seconds,
}: SnsNeuron): bigint =>
  BigInt(
    Math.max(
      Number(created_timestamp_seconds) +
        Number(fromNullable(vesting_period_seconds) ?? 0n) -
        nowInSeconds(),
      0
    )
  );

/**
 * Returns whether the neuron is still vesting.
 */
export const isVesting = (neuron: SnsNeuron): boolean =>
  vestingInSeconds(neuron) > 0n;

export const neuronDashboardUrl = ({
  neuron,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  rootCanisterId: Principal;
}) =>
  `https://dashboard.internetcomputer.org/sns/${rootCanisterId.toText()}/neuron/${getSnsNeuronIdAsHexString(
    neuron
  )}`;
