import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "$lib/constants/constants";
import {
  DEFAULT_TRANSACTION_FEE_E8S,
  E8S_PER_ICP,
} from "$lib/constants/icp.constants";
import {
  MAX_NEURONS_MERGED,
  MIN_NEURON_STAKE,
  SPAWN_VARIANCE_PERCENTAGE,
} from "$lib/constants/neurons.constants";
import { DEPRECATED_TOPICS } from "$lib/constants/proposals.constants";
import type { AccountsStore } from "$lib/stores/accounts.store";
import type { NeuronsStore } from "$lib/stores/neurons.store";
import type { VoteRegistrationStore } from "$lib/stores/vote-registration.store";
import type { Account } from "$lib/types/account";
import type { Identity } from "@dfinity/agent";
import type { WizardStep } from "@dfinity/gix-components";
import {
  IconHistoryToggleOff,
  IconLockClock,
  IconLockOpen,
} from "@dfinity/gix-components";
import {
  NeuronState,
  Topic,
  Vote,
  votedNeurons,
  type BallotInfo,
  type Followees,
  type Neuron,
  type NeuronId,
  type NeuronInfo,
  type ProposalId,
  type ProposalInfo,
} from "@dfinity/nns";
import type { SvelteComponent } from "svelte";
import {
  getAccountByPrincipal,
  isAccountHardwareWallet,
} from "./accounts.utils";
import { nowInSeconds } from "./date.utils";
import { enumValues } from "./enum.utils";
import { formatNumber } from "./format.utils";
import { getVotingBallot, getVotingPower } from "./proposals.utils";
import { formatToken } from "./token.utils";
import { isDefined, isNullish, nonNullish } from "./utils";

export type StateInfo = {
  textKey: string;
  Icon?: typeof SvelteComponent;
  status: "ok" | "warn" | "spawning";
};

type StateMapper = {
  [key: number]: StateInfo;
};
export const stateTextMapper: StateMapper = {
  [NeuronState.Locked]: {
    textKey: "locked",
    Icon: IconLockClock,
    status: "ok",
  },
  [NeuronState.Unspecified]: {
    textKey: "unspecified",
    status: "ok",
  },
  [NeuronState.Dissolved]: {
    textKey: "dissolved",
    Icon: IconLockOpen,
    status: "ok",
  },
  [NeuronState.Dissolving]: {
    textKey: "dissolving",
    Icon: IconHistoryToggleOff,
    status: "warn",
  },
  [NeuronState.Spawning]: {
    textKey: "spawning",
    Icon: IconHistoryToggleOff,
    status: "spawning",
  },
};

export const getStateInfo = (neuronState: NeuronState): StateInfo | undefined =>
  stateTextMapper[neuronState];

export const votingPower = ({
  stake,
  dissolveDelayInSeconds,
  ageSeconds = 0,
}: {
  stake: bigint;
  dissolveDelayInSeconds: number;
  ageSeconds?: number;
}): bigint =>
  dissolveDelayInSeconds > SECONDS_IN_HALF_YEAR
    ? BigInt(
        Math.round(
          (Number(stake) / E8S_PER_ICP) *
            dissolveDelayMultiplier(dissolveDelayInSeconds) *
            ageMultiplier(ageSeconds) *
            E8S_PER_ICP
        )
      )
    : BigInt(0);

// TODO: Do we need this? What does it mean to have a valid stake?
// TODO: https://dfinity.atlassian.net/browse/L2-507
export const hasValidStake = (neuron: NeuronInfo): boolean =>
  // Ignore if we can't validate the stake
  nonNullish(neuron.fullNeuron)
    ? neuron.fullNeuron.cachedNeuronStake +
        neuron.fullNeuron.maturityE8sEquivalent >
      BigInt(DEFAULT_TRANSACTION_FEE_E8S)
    : false;

export const dissolveDelayMultiplier = (delayInSeconds: number): number =>
  1 +
  1 *
    (Math.min(delayInSeconds, SECONDS_IN_EIGHT_YEARS) / SECONDS_IN_EIGHT_YEARS);

export const getDissolvingTimeInSeconds = (
  neuron: NeuronInfo
): bigint | undefined =>
  neuron.state === NeuronState.Dissolving &&
  neuron.fullNeuron?.dissolveState !== undefined &&
  "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState
    ? neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds -
      BigInt(nowInSeconds())
    : undefined;

export const getSpawningTimeInSeconds = (
  neuron: NeuronInfo
): bigint | undefined =>
  isSpawning(neuron) && neuron.fullNeuron?.spawnAtTimesSeconds !== undefined
    ? neuron.fullNeuron.spawnAtTimesSeconds - BigInt(nowInSeconds())
    : undefined;

export const ageMultiplier = (ageSeconds: number): number =>
  1 +
  0.25 * (Math.min(ageSeconds, SECONDS_IN_FOUR_YEARS) / SECONDS_IN_FOUR_YEARS);

export const formatVotingPower = (value: bigint): string =>
  formatNumber(Number(value) / E8S_PER_ICP);

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
    (fullNeuron?.maturityE8sEquivalent ?? BigInt(0)) +
      (fullNeuron?.stakedMaturityE8sEquivalent ?? BigInt(0))
  );

/**
 * Format the staked maturity in a value (token "currency") way.
 * @param {NeuronInfo} neuron The neuron that contains the `stakedMaturityE8sEquivalent` that will be formatted if a `fullNeuron` is available
 */
export const formattedStakedMaturity = ({ fullNeuron }: NeuronInfo): string =>
  formatMaturity(fullNeuron?.stakedMaturityE8sEquivalent);

const formatMaturity = (value?: bigint): string =>
  formatToken({
    value: isNullish(value) ? BigInt(0) : value,
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
  accounts: AccountsStore;
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
  accounts: AccountsStore;
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

/**
 * Calculate neuron stake (cachedNeuronStake - neuronFees)
 * @returns 0n if stake not available
 */
export const neuronStake = (neuron: NeuronInfo): bigint =>
  neuron.fullNeuron?.cachedNeuronStake !== undefined
    ? neuron.fullNeuron?.cachedNeuronStake - neuron.fullNeuron?.neuronFees
    : BigInt(0);

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
  feeE8s = BigInt(0),
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
  return maturitySelected >= MIN_NEURON_STAKE / SPAWN_VARIANCE_PERCENTAGE;
};

export const isSpawning = (neuron: NeuronInfo): boolean =>
  neuron.state === NeuronState.Spawning;

// Tested with `mapMergeableNeurons`
const isMergeableNeuron = ({
  neuron,
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: AccountsStore;
}): boolean =>
  !hasJoinedCommunityFund(neuron) &&
  !isSpawning(neuron) &&
  // Merging hardware wallet neurons is not yet supported
  isNeuronControllableByUser({ neuron, mainAccount: accounts.main });

const getMergeableNeuronMessageKey = ({
  neuron,
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: AccountsStore;
}): string | undefined => {
  if (hasJoinedCommunityFund(neuron)) {
    return "neurons.cannot_merge_neuron_community";
  }
  if (isSpawning(neuron)) {
    return "neurons.cannot_merge_neuron_spawning";
  }
  if (isNeuronControlledByHardwareWallet({ neuron, accounts })) {
    return "neurons.cannot_merge_hardware_wallet";
  }
  if (!isNeuronControllable({ neuron, accounts })) {
    return "neurons.cannot_merge_neuron_hotkey";
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
  accounts: AccountsStore;
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
    ? enumValues(Topic).filter((topic) => topic !== Topic.ManageNeuron)
    : enumValues(Topic)
  ).filter((topic) => !DEPRECATED_TOPICS.includes(topic));

// NeuronInfo is public info.
// fullNeuron is only for users with access.
export const userAuthorizedNeuron = (neuron: NeuronInfo): boolean =>
  neuron.fullNeuron !== undefined;

export type CompactNeuronInfo = {
  id: NeuronId;
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
      id: neuron.neuronId,
      votingPower: getVotingPower({ neuron, proposal }),
      vote: getVote({ neuron, proposal }),
    }))
    // Exclude the cases where the vote was not found.
    .filter(
      (compactNeuronInfoMaybe) => compactNeuronInfoMaybe.vote !== undefined
    ) as CompactNeuronInfo[];

/**
 * @deprecated ultimately "stake maturity" will replace "merge maturity" on hardware wallet too
 */
export const minMaturityMerge = (fee: number): number => fee;

export const hasEnoughMaturityToStake = ({ fullNeuron }: NeuronInfo): boolean =>
  (fullNeuron?.maturityE8sEquivalent ?? BigInt(0)) > BigInt(0);

/**
 * @deprecated ultimately "stake maturity" will replace "merge maturity" on hardware wallet too
 */
export const hasEnoughMaturityToMerge = ({
  neuron: { fullNeuron },
  fee,
}: {
  neuron: NeuronInfo;
  fee: number;
}): boolean =>
  fullNeuron !== undefined &&
  fullNeuron.maturityE8sEquivalent > minMaturityMerge(fee);

export const minNeuronSplittable = (fee: number): number =>
  2 * E8S_PER_ICP + fee;

export const neuronCanBeSplit = ({
  neuron,
  fee,
}: {
  neuron: NeuronInfo;
  fee: number;
}): boolean => neuronStake(neuron) >= BigInt(minNeuronSplittable(fee));

export const getNeuronById = ({
  neuronsStore,
  neuronId,
}: {
  neuronsStore: NeuronsStore;
  neuronId: NeuronId;
}): NeuronInfo | undefined =>
  neuronsStore.neurons?.find((n) => n.neuronId === neuronId);

/** Update neurons voting state as they participated in voting */
export const updateNeuronsVote = ({
  neuron,
  vote,
  proposalId,
}: {
  neuron: NeuronInfo;
  vote: Vote;
  proposalId: ProposalId;
}): NeuronInfo => {
  const newBallot: BallotInfo = {
    vote,
    proposalId,
  };
  const recentBallots = [
    ...neuron.recentBallots.filter(
      ({ proposalId: ballotProposalId }) => ballotProposalId !== proposalId
    ),
    newBallot,
  ].map((ballot) => ({
    ...ballot,
  }));

  return {
    ...neuron,
    recentBallots,
    fullNeuron: {
      ...(neuron.fullNeuron as Neuron),
      recentBallots,
    },
  };
};

/** Is a neuron currently in a vote registration process */
export const neuronVoting = ({
  store: { registrations },
  neuronId,
}: {
  store: VoteRegistrationStore;
  neuronId: NeuronId;
}): boolean =>
  registrations.find(
    ({ neuronIds, successfullyVotedNeuronIds }) =>
      neuronIds.includes(neuronId) &&
      !successfullyVotedNeuronIds.includes(neuronId)
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
  const amountE8s = BigInt(Math.floor(amount * E8S_PER_ICP));
  const neuronStakeE8s = neuron.fullNeuron?.cachedNeuronStake ?? BigInt(0);
  return amountE8s + neuronStakeE8s > MIN_NEURON_STAKE;
};

export const neuronAge = ({ ageSeconds }: NeuronInfo): bigint =>
  BigInt(Math.min(Number(ageSeconds), SECONDS_IN_FOUR_YEARS));
