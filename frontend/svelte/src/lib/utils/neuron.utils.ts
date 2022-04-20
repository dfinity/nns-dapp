import type { Identity } from "@dfinity/agent";
import {
  ICP,
  NeuronState,
  Topic,
  type BallotInfo,
  type NeuronId,
  type NeuronInfo,
} from "@dfinity/nns";
import type { SvelteComponent } from "svelte";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "../constants/constants";
import { E8S_PER_ICP, TRANSACTION_FEE_E8S } from "../constants/icp.constants";
import { MIN_NEURON_STAKE_SPLITTABLE } from "../constants/neurons.constants";
import IconHistoryToggleOff from "../icons/IconHistoryToggleOff.svelte";
import IconLockClock from "../icons/IconLockClock.svelte";
import IconLockOpen from "../icons/IconLockOpen.svelte";
import type { AccountsStore } from "../stores/accounts.store";
import type { Step } from "../stores/steps.state";
import { InvalidAmountError } from "../types/errors";
import { getAccountByPrincipal } from "./accounts.utils";
import { formatNumber } from "./format.utils";
import { isDefined } from "./utils";

export type StateInfo = {
  textKey: string;
  Icon?: typeof SvelteComponent;
  colorVar: "--gray-50" | "--yellow-500" | "--gray-200";
};

type StateMapper = {
  [key: number]: StateInfo;
};
const stateTextMapper: StateMapper = {
  [NeuronState.LOCKED]: {
    textKey: "locked",
    Icon: IconLockClock,
    colorVar: "--gray-50",
  },
  [NeuronState.UNSPECIFIED]: {
    textKey: "unspecified",
    colorVar: "--gray-50",
  },
  [NeuronState.DISSOLVED]: {
    textKey: "dissolved",
    Icon: IconLockOpen,
    colorVar: "--gray-200",
  },
  [NeuronState.DISSOLVING]: {
    textKey: "dissolving",
    Icon: IconHistoryToggleOff,
    colorVar: "--yellow-500",
  },
};

export const getStateInfo = (neuronState: NeuronState): StateInfo =>
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

export const hasValidStake = (neuron: NeuronInfo): boolean =>
  // Ignore if we can't validate the stake
  neuron.fullNeuron
    ? neuron.fullNeuron.cachedNeuronStake +
        neuron.fullNeuron.maturityE8sEquivalent >
      BigInt(TRANSACTION_FEE_E8S)
    : false;

export const dissolveDelayMultiplier = (delayInSeconds: number): number =>
  1 +
  1 *
    (Math.min(delayInSeconds, SECONDS_IN_EIGHT_YEARS) / SECONDS_IN_EIGHT_YEARS);

export const getDissolvingTimeInSeconds = (
  neuron: NeuronInfo
): bigint | undefined =>
  neuron.state === NeuronState.DISSOLVING &&
  neuron.fullNeuron?.dissolveState !== undefined &&
  "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState
    ? neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds -
      BigInt(Math.round(Date.now() / 1000))
    : undefined;

export const ageMultiplier = (ageSeconds: number): number =>
  1 +
  0.25 * (Math.min(ageSeconds, SECONDS_IN_FOUR_YEARS) / SECONDS_IN_FOUR_YEARS);

export const formatVotingPower = (value: bigint): string =>
  formatNumber(Number(value) / E8S_PER_ICP);

export const hasJoinedCommunityFund = (neuron: NeuronInfo): boolean =>
  neuron.joinedCommunityFundTimestampSeconds !== undefined;

export const maturityByStake = (neuron: NeuronInfo): number => {
  if (
    neuron.fullNeuron === undefined ||
    neuron.fullNeuron.cachedNeuronStake <= 0
  ) {
    return 0;
  }
  // Keep at least 6 decimal places in the BigInt division
  const precision = 1_000_000;
  return (
    Number(
      (neuron.fullNeuron.maturityE8sEquivalent * BigInt(precision)) /
        neuron.fullNeuron.cachedNeuronStake
    ) / precision
  );
};

export const sortNeuronsByCreatedTimestamp = (
  neurons: NeuronInfo[]
): NeuronInfo[] =>
  neurons.sort((a, b) =>
    Number(b.createdTimestampSeconds - a.createdTimestampSeconds)
  );

/*
 * Returns true if the neuron can be controlled. A neuron can be controlled if:
 *
 *  1. The user is the controller
 *  OR
 *  2. The main account (same as user) is the controller
 *  OR
 *  3. TODO: The user's hardware wallet is the controller.
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

export const isHotKeyControllable = ({
  neuron: { fullNeuron },
  identity,
}: {
  neuron: NeuronInfo;
  identity?: Identity | null;
}): boolean =>
  fullNeuron?.hotKeys.find(
    (hotkey) => hotkey === identity?.getPrincipal().toText()
  ) !== undefined;

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

export const neuronCanBeSplit = (neuron: NeuronInfo): boolean =>
  neuronStake(neuron) >= BigInt(MIN_NEURON_STAKE_SPLITTABLE);

export const isValidInputAmount = ({
  amount,
  max,
}: {
  amount?: number;
  max: number;
}): boolean => amount !== undefined && amount > 0 && amount <= max;

export const convertNumberToICP = (amount: number): ICP => {
  const stake = ICP.fromString(String(amount));

  if (!(stake instanceof ICP) || stake === undefined) {
    throw new InvalidAmountError();
  }

  return stake;
};

export const isEnoughToStakeNeuron = ({
  stake,
  withTransactionFee = false,
}: {
  stake: ICP;
  withTransactionFee?: boolean;
}): boolean =>
  stake.toE8s() > E8S_PER_ICP + (withTransactionFee ? TRANSACTION_FEE_E8S : 0);

// TODO: Next PR with functionality
export const mergeableNeurons = (neurons: NeuronInfo[]): NeuronInfo[] =>
  neurons;

// TODO: Next PR with functionality
export const canBeMerged = (neurons: NeuronInfo[]): boolean =>
  neurons.length === 2;

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
  currentStep?: Step;
  args: T;
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
