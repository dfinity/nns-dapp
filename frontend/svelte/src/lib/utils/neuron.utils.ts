import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SvelteComponent } from "svelte";
import {
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "../constants/constants";
import { E8S_PER_ICP, TRANSACTION_FEE_E8S } from "../constants/icp.constants";
import IconHistoryToggleOff from "../icons/IconHistoryToggleOff.svelte";
import IconLockClock from "../icons/IconLockClock.svelte";
import IconLockOpen from "../icons/IconLockOpen.svelte";
import type { AccountsStore } from "../stores/accounts.store";
import { getAccountByPrincipal } from "./accounts.utils";
import { formatNumber } from "./format.utils";

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
}): number =>
  dissolveDelayInSeconds > SECONDS_IN_HALF_YEAR
    ? (Number(stake) / E8S_PER_ICP) *
      dissolveDelayMultiplier(dissolveDelayInSeconds) *
      ageMultiplier(ageSeconds)
    : 0;

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

export const ageMultiplier = (ageSeconds: number): number =>
  1 +
  0.25 * (Math.min(ageSeconds, SECONDS_IN_FOUR_YEARS) / SECONDS_IN_FOUR_YEARS);

export const formatVotingPower = (value: bigint): string =>
  formatNumber(Number(value) / E8S_PER_ICP);

export const hasJoinedCommunityFund = (neuron: NeuronInfo): boolean =>
  neuron.joinedCommunityFundTimestampSeconds !== undefined;

export const isCurrentUserController = (neuron: NeuronInfo): boolean =>
  neuron.fullNeuron?.isCurrentUserController === undefined
    ? false
    : Boolean(neuron.fullNeuron?.isCurrentUserController);

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
 *  2. The user's hardware wallet is the controller.
 *
 */
export const isNeuronControllable = ({
  neuron: { fullNeuron },
  accounts,
}: {
  neuron: NeuronInfo;
  accounts: AccountsStore;
}): boolean =>
  fullNeuron?.controller !== undefined &&
  getAccountByPrincipal({ principal: fullNeuron.controller, accounts }) !==
    undefined;

/**
 * Calculate neuron stake (cachedNeuronStake - neuronFees)
 * @returns 0n if stake not available
 */
export const neuronStake = (neuron: NeuronInfo): bigint =>
  neuron.fullNeuron?.cachedNeuronStake !== undefined
    ? neuron.fullNeuron?.cachedNeuronStake - neuron.fullNeuron?.neuronFees
    : BigInt(0);
