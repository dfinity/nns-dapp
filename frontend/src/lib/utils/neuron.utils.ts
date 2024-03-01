import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "$lib/constants/constants";
import {
  DEFAULT_TRANSACTION_FEE_E8S,
  E8S_PER_ICP,
} from "$lib/constants/icp.constants";
import {
  AGE_MULTIPLIER,
  DISSOLVE_DELAY_MULTIPLIER,
  MATURITY_MODULATION_VARIANCE_PERCENTAGE,
  MAX_NEURONS_MERGED,
  MIN_NEURON_STAKE,
  TOPICS_TO_FOLLOW_NNS,
} from "$lib/constants/neurons.constants";
import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import type { NeuronsStore } from "$lib/stores/neurons.store";
import type { VoteRegistrationStoreData } from "$lib/stores/vote-registration.store";
import type { Account } from "$lib/types/account";
import type { Identity } from "@dfinity/agent";
import type { WizardStep } from "@dfinity/gix-components";
import {
  IconDissolving,
  IconHistoryToggleOff,
  IconLockClosed,
  IconLockOpen,
} from "@dfinity/gix-components";
import {
  NeuronState,
  NeuronType,
  Topic,
  Vote,
  ineligibleNeurons,
  votedNeurons,
  type BallotInfo,
  type Followees,
  type Neuron,
  type NeuronId,
  type NeuronInfo,
  type ProposalInfo,
  type RewardEvent,
} from "@dfinity/nns";
import { ICPToken, fromNullable, isNullish, nonNullish } from "@dfinity/utils";
import type { ComponentType } from "svelte";
import {
  getAccountByPrincipal,
  isAccountHardwareWallet,
} from "./accounts.utils";
import { nowInSeconds } from "./date.utils";
import { formatNumber } from "./format.utils";
import { getVotingBallot, getVotingPower } from "./proposals.utils";
import { formatTokenE8s, numberToUlps } from "./token.utils";
import { isDefined } from "./utils";

export type StateInfo = {
  Icon?: ComponentType;
  textKey: keyof I18n["neuron_state"];
};

type StateMapper = Record<NeuronState, StateInfo>;

const stateInfoMapper: StateMapper = {
  [NeuronState.Locked]: {
    Icon: IconLockClosed,
    textKey: "Locked",
  },
  [NeuronState.Unspecified]: {
    Icon: undefined,
    textKey: "Unspecified",
  },
  [NeuronState.Dissolved]: {
    Icon: IconLockOpen,
    textKey: "Dissolved",
  },
  [NeuronState.Dissolving]: {
    Icon: IconDissolving,
    textKey: "Dissolving",
  },
  [NeuronState.Spawning]: {
    Icon: IconHistoryToggleOff,
    textKey: "Spawning",
  },
};

export const getStateInfo = (neuronState: NeuronState): StateInfo =>
  stateInfoMapper[neuronState];

/**
 * Calculation of the voting power of a neuron.
 *
 * If neuron's dissolve delay is less than 6 months, the voting power is 0.
 *
 * Else:
 * votingPower = (stake + staked maturity) * dissolve_delay_bonus * age_bonus
 * dissolve_delay_bonus = 1 + (dissolve_delay_multiplier * neuron dissolve delay / 8 years)
 * age_bonus = 1 + (age_multiplier * ageSeconds / 4 years)
 *
 * dissolve_delay_multiplier is 1 in NNS
 * age_multiplier is 0.25 in NNS
 *
 * ageSeconds is capped at 4 years
 * neuron dissolve delay is capped at 8 years
 *
 * Reference: https://internetcomputer.org/docs/current/tokenomics/sns/rewards#recap-on-nns-voting-rewards
 *
 * @param {Object} params
 * @param {NeuronInfo} params.neuron
 * @param {number} params.newDissolveDelayInSeconds It will calculate the voting power with the new dissolve delay if provided
 * @returns {bigint}
 */
export const neuronVotingPower = ({
  neuron,
  newDissolveDelayInSeconds,
}: {
  neuron: NeuronInfo;
  newDissolveDelayInSeconds?: bigint;
}): bigint => {
  const dissolveDelay =
    newDissolveDelayInSeconds ?? neuron.dissolveDelaySeconds;
  const stakeE8s =
    (neuron.fullNeuron?.cachedNeuronStake ?? 0n) +
    (neuron.fullNeuron?.stakedMaturityE8sEquivalent ?? 0n);
  return votingPower({
    stakeE8s,
    dissolveDelay,
    ageSeconds: neuron.ageSeconds,
  });
};

interface VotingPowerParams {
  // Neuron data
  dissolveDelay: bigint;
  stakeE8s: bigint;
  ageSeconds: bigint;
  // Params
  ageBonusMultiplier?: number;
  dissolveBonusMultiplier?: number;
  maxAgeSeconds?: number;
  maxDissolveDelaySeconds?: number;
  minDissolveDelaySeconds?: number;
}
/**
 * For now used only internally in this file.
 *
 * It might be useful to use it for SNS neurons.
 *
 * @param {VotingPowerParams}
 * @returns {bigint}
 */
export const votingPower = ({
  stakeE8s,
  dissolveDelay,
  ageSeconds,
  ageBonusMultiplier = AGE_MULTIPLIER,
  dissolveBonusMultiplier = DISSOLVE_DELAY_MULTIPLIER,
  maxDissolveDelaySeconds = SECONDS_IN_EIGHT_YEARS,
  maxAgeSeconds = SECONDS_IN_FOUR_YEARS,
  minDissolveDelaySeconds = SECONDS_IN_HALF_YEAR,
}: VotingPowerParams): bigint => {
  if (dissolveDelay < minDissolveDelaySeconds) {
    return 0n;
  }
  const dissolveDelayMultiplier = bonusMultiplier({
    amount: dissolveDelay,
    multiplier: dissolveBonusMultiplier,
    max: maxDissolveDelaySeconds,
  });
  const ageMultiplier = bonusMultiplier({
    amount: ageSeconds,
    multiplier: ageBonusMultiplier,
    max: maxAgeSeconds,
  });
  // We don't use dissolveDelayMultiplier and ageMultiplier directly because those are specific to NNS.
  // This function is generic and could be used for SNS.
  return BigInt(
    Math.round(Number(stakeE8s) * dissolveDelayMultiplier * ageMultiplier)
  );
};

export const dissolveDelayMultiplier = (delayInSeconds: bigint): number =>
  bonusMultiplier({
    amount: delayInSeconds,
    multiplier: DISSOLVE_DELAY_MULTIPLIER,
    max: SECONDS_IN_EIGHT_YEARS,
  });

export const ageMultiplier = (ageSeconds: bigint): number =>
  bonusMultiplier({
    amount: ageSeconds,
    multiplier: AGE_MULTIPLIER,
    max: SECONDS_IN_FOUR_YEARS,
  });

export const bonusMultiplier = ({
  amount,
  multiplier,
  max,
}: {
  amount: bigint;
  multiplier: number;
  max: number;
}): number =>
  1 +
  multiplier *
    (Math.min(Number(amount), max) /
      // to avoid NaN
      (max === 0 ? 1 : max));

// TODO: Do we need this? What does it mean to have a valid stake?
// TODO: https://dfinity.atlassian.net/browse/L2-507
export const hasValidStake = (neuron: NeuronInfo): boolean =>
  // Ignore if we can't validate the stake
  nonNullish(neuron.fullNeuron)
    ? neuron.fullNeuron.cachedNeuronStake +
        neuron.fullNeuron.maturityE8sEquivalent >
      BigInt(DEFAULT_TRANSACTION_FEE_E8S)
    : false;

export const getDissolvingTimestampSeconds = (
  neuron: NeuronInfo
): bigint | undefined =>
  neuron.state === NeuronState.Dissolving &&
  neuron.fullNeuron?.dissolveState !== undefined &&
  "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState
    ? neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds
    : undefined;

export const getDissolvingTimeInSeconds = (
  neuron: NeuronInfo
): bigint | undefined => {
  const dissolvingTimestamp = getDissolvingTimestampSeconds(neuron);
  return nonNullish(dissolvingTimestamp)
    ? dissolvingTimestamp - BigInt(nowInSeconds())
    : undefined;
};

export const getSpawningTimeInSeconds = (
  neuron: NeuronInfo
): bigint | undefined =>
  isSpawning(neuron) && neuron.fullNeuron?.spawnAtTimesSeconds !== undefined
    ? neuron.fullNeuron.spawnAtTimesSeconds - BigInt(nowInSeconds())
    : undefined;

export const formatVotingPower = (value: bigint | number): string =>
  formatNumber(Number(value) / E8S_PER_ICP);

export const isSeedNeuron = (neuron: NeuronInfo): boolean =>
  neuron.neuronType === NeuronType.Seed;

export const isEctNeuron = (neuron: NeuronInfo): boolean =>
  neuron.neuronType === NeuronType.Ect;

export const hasJoinedCommunityFund = (neuron: NeuronInfo): boolean =>
  neuron.joinedCommunityFundTimestampSeconds !== undefined;

/**
 * Has the neuron the auto stake maturity feature turned on?
 * @param {NeuronInfo} neuron The neuron which potential has the feature on
 */
export const hasAutoStakeMaturityOn = ({ fullNeuron }: NeuronInfo): boolean =>
  fullNeuron?.autoStakeMaturity === true;

/**
 * Format the maturity in a value (token "currency") way.
 * @param {NeuronInfo} neuron The neuron that contains the `maturityE8sEquivalent` that will be formatted if a `fullNeuron` is available
 */
export const formattedMaturity = ({ fullNeuron }: NeuronInfo): string =>
  formatMaturity(fullNeuron?.maturityE8sEquivalent);

/**
 * Format the sum of the maturity and staked maturity in a value (token "currency") way.
 * @param {NeuronInfo} neuron The neuron that contains the `maturityE8sEquivalent` and `stakedMaturityE8sEquivalent` which will be summed and formatted if a `fullNeuron` is available
 */
export const formattedTotalMaturity = ({ fullNeuron }: NeuronInfo): string =>
  formatMaturity(
    (fullNeuron?.maturityE8sEquivalent ?? 0n) +
      (fullNeuron?.stakedMaturityE8sEquivalent ?? 0n)
  );

/**
 * Format the staked maturity in a value (token "currency") way.
 * @param {NeuronInfo} neuron The neuron that contains the `stakedMaturityE8sEquivalent` that will be formatted if a `fullNeuron` is available
 */
export const formattedStakedMaturity = ({ fullNeuron }: NeuronInfo): string =>
  formatMaturity(fullNeuron?.stakedMaturityE8sEquivalent);

export const formatMaturity = (value?: bigint): string =>
  formatTokenE8s({
    value: isNullish(value) ? 0n : value,
  });

export const sortNeuronsByCreatedTimestamp = (
  neurons: NeuronInfo[]
): NeuronInfo[] =>
  [...neurons].sort((a, b) =>
    Number(b.createdTimestampSeconds - a.createdTimestampSeconds)
  );

/*
 * Returns true if the neuron can be controlled by current user
 */
export const isNeuronControllableByUser = ({
  neuron: { fullNeuron },
  mainAccount,
}: {
  neuron: NeuronInfo;
  mainAccount?: Account;
}): boolean =>
  fullNeuron?.controller !== undefined &&
  mainAccount?.type === "main" &&
  fullNeuron.controller === mainAccount.principal?.toText();

/*
 * Returns true if the neuron can be controlled. A neuron can be controlled if:
 *
 *  1. The user is the controller
 *  OR
 *  2. The main account (same as user) is the controller
 *  OR
 *  3. The user's hardware wallet is the controller.
 *
 */
export const isNeuronControllable = ({
  neuron: { fullNeuron },
  identity,
  accounts,
}: {
  neuron: NeuronInfo;
  identity?: Identity | null;
  accounts: IcpAccountsStoreData;
}): boolean =>
  fullNeuron?.controller !== undefined &&
  (fullNeuron.controller === identity?.getPrincipal().toText() ||
    getAccountByPrincipal({ principal: fullNeuron.controller, accounts }) !==
      undefined);

export const isNeuronControlledByHardwareWallet = ({
  neuron,
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: IcpAccountsStoreData;
}): boolean => {
  if (neuron.fullNeuron?.controller !== undefined) {
    const account = getAccountByPrincipal({
      principal: neuron.fullNeuron.controller,
      accounts,
    });
    return isAccountHardwareWallet(account);
  }
  return false;
};

export const isHotKeyControllable = ({
  neuron: { fullNeuron },
  identity,
}: {
  neuron: NeuronInfo;
  identity?: Identity | null;
}): boolean =>
  fullNeuron?.hotKeys.find(
    (hotkey) => hotkey === identity?.getPrincipal().toText()
  ) !== undefined &&
  fullNeuron.controller !== identity?.getPrincipal().toText();

export type NeuronTagData = {
  text: string;
};

export const getNeuronTags = ({
  neuron,
  identity,
  accounts,
  i18n,
}: {
  neuron: NeuronInfo;
  identity?: Identity | null;
  accounts: IcpAccountsStoreData;
  i18n: I18n;
}): NeuronTagData[] => {
  const tags: NeuronTagData[] = [];

  if (isSeedNeuron(neuron)) {
    tags.push({ text: i18n.neuron_types.seed });
  } else if (isEctNeuron(neuron)) {
    tags.push({ text: i18n.neuron_types.ect });
  }

  if (hasJoinedCommunityFund(neuron)) {
    tags.push({ text: i18n.neurons.community_fund });
  }
  const isHWControlled = isNeuronControlledByHardwareWallet({
    neuron,
    accounts,
  });
  if (isHWControlled) {
    tags.push({ text: i18n.neurons.hardware_wallet_control });
    // All HW controlled are hotkeys, but we don't want to show both tags to the user.
  } else if (isHotKeyControllable({ neuron, identity })) {
    tags.push({ text: i18n.neurons.hotkey_control });
  }
  return tags;
};

/**
 * An identity can manage the neurons' fund participation when one of the below is true:
 * - User is the controller.
 * - User is a hotkey, but a hardware wallet account is NOT the controller.
 *
 * Technically, HW can manage SNS neurons, but we don't support it yet in the NNS Dapp.
 * That's why we want to avoid HW controlled neurons from participating in a swap.
 * Both joining the Neurons' Fund and participating in a swap is disabled for hardware wallets.
 */
export const canUserManageNeuronFundParticipation = ({
  neuron,
  identity,
  accounts,
}: {
  neuron: NeuronInfo;
  identity: Identity | null | undefined;
  accounts: IcpAccountsStoreData;
}): boolean =>
  nonNullish(identity) &&
  (isNeuronControllableByUser({ neuron, mainAccount: accounts.main }) ||
    (isHotKeyControllable({ neuron, identity }) &&
      !isNeuronControlledByHardwareWallet({ neuron, accounts })));

/**
 * Calculate neuron stake (cachedNeuronStake - neuronFees)
 * @returns 0n if stake not available
 */
export const neuronStake = (neuron: NeuronInfo): bigint =>
  neuron.fullNeuron?.cachedNeuronStake !== undefined
    ? neuron.fullNeuron?.cachedNeuronStake - neuron.fullNeuron?.neuronFees
    : 0n;

export interface FolloweesNeuron {
  neuronId: NeuronId;
  topics: [Topic, ...Topic[]];
}
/**
 * Transforms Neuron.Followees into FolloweesNeuron[] format
 */
export const followeesNeurons = (neuron: NeuronInfo): FolloweesNeuron[] => {
  if (neuron.fullNeuron?.followees === undefined) {
    return [];
  }
  const result: FolloweesNeuron[] = [];
  const resultNeuron = (neuronId: NeuronId): FolloweesNeuron | undefined =>
    result.find(({ neuronId: id }) => id === neuronId);

  for (const { followees, topic } of neuron.fullNeuron.followees) {
    for (const neuronId of followees) {
      const followeesNeuron = resultNeuron(neuronId);
      if (followeesNeuron === undefined) {
        result.push({
          neuronId,
          topics: [topic],
        });
      } else {
        followeesNeuron.topics.push(topic);
      }
    }
  }

  return result;
};

/**
 * Returns neuron ballots that contain "proposalId"
 */
export const ballotsWithDefinedProposal = ({
  recentBallots,
}: NeuronInfo): Required<BallotInfo>[] =>
  recentBallots.filter(
    ({ proposalId }: BallotInfo) => proposalId !== undefined
  );

export const isValidInputAmount = ({
  amount,
  max,
}: {
  amount?: number;
  max: number;
}): boolean => amount !== undefined && amount > 0 && amount <= max;

export const isEnoughToStakeNeuron = ({
  stakeE8s,
  feeE8s = 0n,
}: {
  stakeE8s: bigint;
  feeE8s?: bigint;
}): boolean => stakeE8s >= BigInt(MIN_NEURON_STAKE) + feeE8s;

export const isEnoughMaturityToSpawn = ({
  neuron: { fullNeuron },
  percentage,
}: {
  neuron: NeuronInfo;
  percentage: number;
}): boolean => {
  if (fullNeuron === undefined) {
    return false;
  }
  const maturitySelected = Math.floor(
    (Number(fullNeuron.maturityE8sEquivalent) * percentage) / 100
  );
  return (
    maturitySelected >=
    Number(MIN_NEURON_STAKE) / MATURITY_MODULATION_VARIANCE_PERCENTAGE
  );
};

export const isSpawning = (neuron: NeuronInfo): boolean =>
  neuron.state === NeuronState.Spawning;

const isLocked = (neuron: NeuronInfo): boolean =>
  neuron.state === NeuronState.Locked;

// Tested with `mapMergeableNeurons`
const isMergeableNeuron = ({
  neuron,
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: IcpAccountsStoreData;
}): boolean =>
  !hasJoinedCommunityFund(neuron) &&
  !isSpawning(neuron) &&
  isLocked(neuron) &&
  isNeuronControllable({ neuron, accounts });

const getMergeableNeuronMessageKey = ({
  neuron,
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: IcpAccountsStoreData;
}): string | undefined => {
  if (hasJoinedCommunityFund(neuron)) {
    return "neurons.cannot_merge_neuron_community";
  }
  if (isSpawning(neuron)) {
    return "neurons.cannot_merge_neuron_spawning";
  }
  if (!isNeuronControllable({ neuron, accounts })) {
    return "neurons.cannot_merge_neuron_hotkey";
  }
  if (!isLocked(neuron)) {
    return "neurons.cannot_merge_neuron_state";
  }
};

export type MergeableNeuron = {
  mergeable: boolean;
  selected: boolean;
  messageKey?: string;
  neuron: NeuronInfo;
};
/**
 * Returns neuron data wrapped with extra information about mergeability.
 *
 * @neurons NeuronInfo[]
 * @accounts AccountsStore
 * @selectedNeuronIds NeuronId[]
 * @returns MergeableNeuron[]
 */
export const mapMergeableNeurons = ({
  neurons,
  accounts,
  selectedNeurons,
}: {
  neurons: NeuronInfo[];
  accounts: IcpAccountsStoreData;
  selectedNeurons: NeuronInfo[];
}): MergeableNeuron[] =>
  neurons
    // First we consider the neuron on itself
    .map((neuron: NeuronInfo) => ({
      neuron,
      selected: selectedNeurons
        .map(({ neuronId }) => neuronId)
        .includes(neuron.neuronId),
      mergeable: isMergeableNeuron({ neuron, accounts }),
      messageKey: getMergeableNeuronMessageKey({ neuron, accounts }),
    }))
    // Then we calculate the neuron with the current selection
    .map(({ mergeable, selected, messageKey, neuron }: MergeableNeuron) => {
      // If not mergeable by itself or already selected, we keep the data.
      if (!mergeable || selected) {
        return { mergeable, selected, messageKey, neuron };
      }
      // Max selection, but not one of the current neurons
      if (selectedNeurons.length >= MAX_NEURONS_MERGED) {
        return {
          neuron,
          selected,
          mergeable: false,
          messageKey: "neurons.only_merge_two",
        };
      }
      // Compare with current selected neuron
      if (selectedNeurons.length === 1) {
        const [selectedNeuron] = selectedNeurons;
        const { isValid, messageKey } = canBeMerged([selectedNeuron, neuron]);
        return {
          neuron,
          selected,
          mergeable: isValid,
          messageKey,
        };
      }
      return { mergeable, selected, messageKey, neuron };
    });

const sameController = (neurons: NeuronInfo[]): boolean =>
  new Set(
    neurons.map(({ neuronId, fullNeuron }) =>
      // If fullNeuron is not present
      fullNeuron === undefined ? String(neuronId) : fullNeuron.controller
    )
  ).size === 1;

const sameId = (neurons: NeuronInfo[]): boolean =>
  new Set(neurons.map(({ neuronId }) => neuronId)).size === 1;

const sameNeuronType = (neurons: NeuronInfo[]): boolean =>
  new Set(neurons.map(({ neuronType }) => neuronType)).size === 1;

/**
 * Receives multiple lists of followees sorted by id.
 *
 * Compares that the followees are all the same.
 *
 * @param sortedFolloweesLists NeuronId[][].
 * For example:
 *  [[2, 4, 5], [1, 2, 3]] returns `false`
 *  [[2, 5, 6], [2, 5, 6]] returns `true`
 *  [[], []] return `true`
 * @returns boolean
 */
export const allHaveSameFollowees = (
  sortedFolloweesLists: NeuronId[][]
): boolean =>
  new Set(sortedFolloweesLists.map((list) => list.join())).size === 1;

const sameManageNeuronFollowees = (neurons: NeuronInfo[]): boolean => {
  const fullNeurons: Neuron[] = neurons
    .map(({ fullNeuron }) => fullNeuron)
    .filter(isDefined);
  // If we don't have the info, return false
  if (fullNeurons.length === 0) {
    return false;
  }
  const sortedFollowees: NeuronId[][] = fullNeurons
    .map(
      ({ followees }): Followees =>
        followees.find(({ topic }) => topic === Topic.ManageNeuron) ?? {
          topic: Topic.ManageNeuron,
          followees: [],
        }
    )
    .map(({ followees }) => followees.sort());
  return allHaveSameFollowees(sortedFollowees);
};

/**
 * This function checks whether two or more neurons can be merged
 * but it doesn't check if each neuron is mergeable.
 *
 * The mergeability of each neuron should be checked before calling this function.
 */
export const canBeMerged = (
  neurons: NeuronInfo[]
): { isValid: boolean; messageKey?: string } => {
  if (neurons.length !== MAX_NEURONS_MERGED) {
    return {
      isValid: false,
    };
  }
  if (sameId(neurons)) {
    return {
      isValid: false,
      messageKey: "error.merge_neurons_same_id",
    };
  }
  if (!sameNeuronType(neurons)) {
    return {
      isValid: false,
      messageKey: "error.merge_neurons_different_types",
    };
  }
  if (!sameController(neurons)) {
    return {
      isValid: false,
      messageKey: "error.merge_neurons_not_same_controller",
    };
  }
  return sameManageNeuronFollowees(neurons)
    ? {
        isValid: true,
      }
    : {
        isValid: false,
        messageKey: "error.merge_neurons_not_same_manage_neuron_followees",
      };
};

export const mapNeuronIds = ({
  neuronIds,
  neurons,
}: {
  neuronIds: NeuronId[];
  neurons: NeuronInfo[];
}) =>
  neuronIds
    .map((selectedId) =>
      neurons.find(({ neuronId }) => neuronId === selectedId)
    )
    .filter(isDefined);

export type InvalidState<T> = {
  stepName: string;
  isInvalid: (arg?: T) => boolean;
  onInvalid: () => void;
};

// Checks if there is an invalid state in a Wizard Step
export const checkInvalidState = <T>({
  invalidStates,
  currentStep,
  args,
}: {
  invalidStates: InvalidState<T>[];
  currentStep?: WizardStep;
  args: T | undefined;
}): void => {
  invalidStates
    .filter(
      ({ stepName, isInvalid }) =>
        stepName === currentStep?.name && isInvalid(args)
    )
    .forEach(({ onInvalid }) => onInvalid());
};

export const isIdentityController = ({
  neuron,
  identity,
}: {
  neuron: NeuronInfo;
  identity?: Identity | null;
}): boolean => {
  if (identity === null || identity === undefined) {
    return false;
  }
  return neuron.fullNeuron?.controller === identity.getPrincipal().toText();
};

export const followeesByTopic = ({
  neuron,
  topic,
}: {
  neuron: NeuronInfo | undefined;
  topic: Topic;
}): NeuronId[] | undefined =>
  neuron?.fullNeuron?.followees.find(
    ({ topic: followedTopic }) => topic === followedTopic
  )?.followees;

/**
 * NeuronManagement proposals are not public so we hide this topic
 * (unless the neuron already has followees on this topic)
 * https://github.com/dfinity/nns-dapp/pull/511
 *
 * Filter out deprecated topics.
 */
export const topicsToFollow = (neuron: NeuronInfo): Topic[] =>
  (followeesByTopic({ neuron, topic: Topic.ManageNeuron }) === undefined
    ? TOPICS_TO_FOLLOW_NNS.filter((topic) => topic !== Topic.ManageNeuron)
    : TOPICS_TO_FOLLOW_NNS
  ).filter((topic) => !DEPRECATED_TOPICS.includes(topic));

// NeuronInfo is public info.
// fullNeuron is only for users with access.
export const userAuthorizedNeuron = (neuron: NeuronInfo): boolean =>
  neuron.fullNeuron !== undefined;

export type CompactNeuronInfo = {
  idString: string;
  votingPower: bigint;
  vote: Vote;
};

const getRecentBallot = ({
  neuron,
  proposalId,
}: {
  neuron: NeuronInfo;
  proposalId?: bigint;
}): BallotInfo | undefined =>
  neuron.recentBallots.find(
    ({ proposalId: currentId }) => currentId === proposalId
  );

// We try to get the vote from the neurons ballots and also from the proposal ballots
const getVote = ({
  neuron,
  proposal,
}: {
  neuron: NeuronInfo;
  proposal: ProposalInfo;
}): Vote | undefined =>
  getRecentBallot({ neuron, proposalId: proposal.id })?.vote ??
  getVotingBallot({ neuronId: neuron.neuronId, proposalInfo: proposal })?.vote;

export const votedNeuronDetails = ({
  neurons,
  proposal,
}: {
  neurons: NeuronInfo[];
  proposal: ProposalInfo;
}): CompactNeuronInfo[] =>
  votedNeurons({
    neurons,
    proposal,
  })
    .map((neuron) => ({
      idString: neuron.neuronId.toString(),
      votingPower: getVotingPower({ neuron, proposal }),
      vote: getVote({ neuron, proposal }),
    }))
    // Exclude the cases where the vote was not found.
    .filter(
      (compactNeuronInfoMaybe) => compactNeuronInfoMaybe.vote !== undefined
    ) as CompactNeuronInfo[];

export const neuronsVotingPower = (neurons?: CompactNeuronInfo[]): bigint =>
  neurons?.reduce((sum, { votingPower }) => sum + votingPower, 0n) ?? 0n;

export const hasEnoughMaturityToStake = ({ fullNeuron }: NeuronInfo): boolean =>
  (fullNeuron?.maturityE8sEquivalent ?? 0n) > 0n;

export const minNeuronSplittable = (fee: bigint): bigint =>
  2n * MIN_NEURON_STAKE + fee;

export const neuronCanBeSplit = ({
  neuron,
  fee,
}: {
  neuron: NeuronInfo;
  fee: bigint;
}): boolean => neuronStake(neuron) >= minNeuronSplittable(fee);

export const getNeuronById = ({
  neuronsStore,
  neuronId,
}: {
  neuronsStore: NeuronsStore;
  neuronId: NeuronId;
}): NeuronInfo | undefined =>
  neuronsStore.neurons?.find((n) => n.neuronId === neuronId);

/** Is a neuron currently in a vote registration process */
export const neuronVoting = ({
  store: { registrations },
  neuronIdString,
}: {
  store: VoteRegistrationStoreData;
  neuronIdString: string;
}): boolean =>
  (registrations[OWN_CANISTER_ID_TEXT] ?? []).find(
    ({ neuronIdStrings, successfullyVotedNeuronIdStrings }) =>
      neuronIdStrings.includes(`${neuronIdString}`) &&
      !successfullyVotedNeuronIdStrings.includes(neuronIdString)
  ) !== undefined;

// Check whether the amount to top up is valid.
// Otherwise the claiming neuron doesn't work because the amount is too small.
export const validTopUpAmount = ({
  amount,
  neuron,
}: {
  neuron: NeuronInfo;
  amount: number;
}): boolean => {
  const amountUlps = numberToUlps({ amount, token: ICPToken });
  const neuronStakeUlps = neuron.fullNeuron?.cachedNeuronStake ?? 0n;
  return amountUlps + neuronStakeUlps > MIN_NEURON_STAKE;
};

export const neuronAge = ({ ageSeconds }: NeuronInfo): bigint =>
  BigInt(Math.min(Number(ageSeconds), SECONDS_IN_FOUR_YEARS));

/** NNS neuron can be ineligible only for two reasons: "since" and "short" */
export type NeuronIneligibilityReason = "since" | "short" | "no-permission";

/**
 * Represents an entry in the list of ineligible neurons.
 * - 'short': the neuron is too young to vote
 * - 'since': the neuron was created after the proposal was submitted
 */
export interface IneligibleNeuronData {
  neuronIdString: string;
  reason: NeuronIneligibilityReason | undefined;
}
export const filterIneligibleNnsNeurons = ({
  neurons,
  proposal,
}: {
  neurons: NeuronInfo[];
  proposal: ProposalInfo;
}): IneligibleNeuronData[] =>
  ineligibleNeurons({
    neurons,
    proposal,
  }).map(({ createdTimestampSeconds, neuronId }) => ({
    neuronIdString: neuronId.toString(),
    reason:
      createdTimestampSeconds > proposal.proposalTimestampSeconds
        ? "since"
        : "short",
  }));

/// Returns timestamp in seconds of last maturity distribution event
export const maturityLastDistribution = ({
  actual_timestamp_seconds,
  rounds_since_last_distribution,
  settled_proposals,
}: RewardEvent): bigint => {
  // Rewards were distributed that round (the most recent reward event was not a rollover), so the timestamp is correct
  if (settled_proposals.length > 0) {
    return actual_timestamp_seconds;
  }

  // When there was a reward event, but no rewards were distributed (because of a rollover)
  return (
    actual_timestamp_seconds -
    (fromNullable(rounds_since_last_distribution) ?? 1n) *
      BigInt(SECONDS_IN_DAY)
  );
};

export const neuronDashboardUrl = ({ neuronId }: NeuronInfo): string =>
  `https://dashboard.internetcomputer.org/neuron/${neuronId.toString()}`;

export const getTopicTitle = ({
  topic,
  i18n,
}: {
  topic: Topic;
  i18n: I18n;
}): string => {
  const mapper: Record<Topic, string> = {
    [Topic.Unspecified]: i18n.follow_neurons.topic_0_title,
    [Topic.ManageNeuron]: i18n.follow_neurons.topic_1_title,
    [Topic.ExchangeRate]: i18n.follow_neurons.topic_2_title,
    [Topic.NetworkEconomics]: i18n.follow_neurons.topic_3_title,
    [Topic.Governance]: i18n.follow_neurons.topic_4_title,
    [Topic.NodeAdmin]: i18n.follow_neurons.topic_5_title,
    [Topic.ParticipantManagement]: i18n.follow_neurons.topic_6_title,
    [Topic.SubnetManagement]: i18n.follow_neurons.topic_7_title,
    [Topic.NetworkCanisterManagement]: i18n.follow_neurons.topic_8_title,
    [Topic.Kyc]: i18n.follow_neurons.topic_9_title,
    [Topic.NodeProviderRewards]: i18n.follow_neurons.topic_10_title,
    [Topic.SnsDecentralizationSale]: i18n.follow_neurons.topic_11_title,
    [Topic.SubnetReplicaVersionManagement]: i18n.follow_neurons.topic_12_title,
    [Topic.ReplicaVersionManagement]: i18n.follow_neurons.topic_13_title,
    [Topic.SnsAndCommunityFund]: i18n.follow_neurons.topic_14_title,
    [Topic.ApiBoundaryNodeManagement]: i18n.follow_neurons.topic_15_title,
  };
  return mapper[topic];
};

export const getTopicSubtitle = ({
  topic,
  i18n,
}: {
  topic: Topic;
  i18n: I18n;
}): string => {
  const mapper: Record<Topic, string> = {
    [Topic.Unspecified]: i18n.follow_neurons.topic_0_subtitle,
    [Topic.ManageNeuron]: i18n.follow_neurons.topic_1_subtitle,
    [Topic.ExchangeRate]: i18n.follow_neurons.topic_2_subtitle,
    [Topic.NetworkEconomics]: i18n.follow_neurons.topic_3_subtitle,
    [Topic.Governance]: i18n.follow_neurons.topic_4_subtitle,
    [Topic.NodeAdmin]: i18n.follow_neurons.topic_5_subtitle,
    [Topic.ParticipantManagement]: i18n.follow_neurons.topic_6_subtitle,
    [Topic.SubnetManagement]: i18n.follow_neurons.topic_7_subtitle,
    [Topic.NetworkCanisterManagement]: i18n.follow_neurons.topic_8_subtitle,
    [Topic.Kyc]: i18n.follow_neurons.topic_9_subtitle,
    [Topic.NodeProviderRewards]: i18n.follow_neurons.topic_10_subtitle,
    [Topic.SnsDecentralizationSale]: i18n.follow_neurons.topic_11_subtitle,
    [Topic.SubnetReplicaVersionManagement]:
      i18n.follow_neurons.topic_12_subtitle,
    [Topic.ReplicaVersionManagement]: i18n.follow_neurons.topic_13_subtitle,
    [Topic.SnsAndCommunityFund]: i18n.follow_neurons.topic_14_subtitle,
    [Topic.ApiBoundaryNodeManagement]: i18n.follow_neurons.topic_15_subtitle,
  };
  return mapper[topic];
};
