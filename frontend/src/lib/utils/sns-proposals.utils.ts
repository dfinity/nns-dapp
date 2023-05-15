import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
import {
  SNS_MIN_NUMBER_VOTES_FOR_PROPOSAL_RATIO,
  SNS_PROPOSAL_COLOR,
} from "$lib/constants/sns-proposals.constants";
import { i18n } from "$lib/stores/i18n";
import type { VotingNeuron } from "$lib/types/proposals";
import {
  getSnsNeuronIdAsHexString,
  snsNeuronVotingPower,
} from "$lib/utils/sns-neuron.utils";
import type { Vote } from "@dfinity/nns";
import type {
  SnsAction,
  SnsBallot,
  SnsNervousSystemFunction,
  SnsNervousSystemParameters,
  SnsNeuron,
  SnsNeuronId,
  SnsProposalData,
  SnsProposalId,
  SnsTally,
  SnsVote,
} from "@dfinity/sns";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
} from "@dfinity/sns";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
import { get } from "svelte/store";
import { nowInSeconds } from "./date.utils";
import { keyOfOptional } from "./utils";

export type SnsProposalDataMap = {
  // Mapped directly from SnsProposalData directly
  id?: SnsProposalId;
  payload_text_rendering?: string;
  action: bigint;
  ballots: Array<[string, SnsBallot]>;
  reward_event_round: bigint;
  failed_timestamp_seconds: bigint;
  proposal_creation_timestamp_seconds: bigint;
  initial_voting_period_seconds: bigint;
  reject_cost_e8s: bigint;
  latest_tally?: SnsTally;
  wait_for_quiet_deadline_increase_seconds: bigint;
  decided_timestamp_seconds: bigint;
  proposer?: SnsNeuronId;
  /** will be removed in the future */
  is_eligible_for_rewards: boolean;
  executed_timestamp_seconds: bigint;

  // Extracted from SnsProposalData.wait_for_quiet_state
  current_deadline_timestamp_seconds?: bigint;

  // Extracted from SnsProposalData.proposal
  title: string;
  url?: string;
  summary: string;
  actionData?: SnsAction;

  // TODO: Should come from backend
  status: SnsProposalDecisionStatus;
  rewardStatus: SnsProposalRewardStatus;

  // Added by us
  statusString: string;
  statusDescription: string;
  rewardStatusString: string;
  rewardStatusDescription: string;
  color: ProposalStatusColor | undefined;

  // Mapped from Nervous Functions
  type?: string;
  typeDescription?: string;
};

// TODO: Return also a type and the type description that for now maps to the topic
export const mapProposalInfo = ({
  proposalData,
  nsFunctions,
}: {
  proposalData: SnsProposalData;
  nsFunctions: SnsNervousSystemFunction[] | undefined;
}): SnsProposalDataMap => {
  const {
    proposal,
    proposer,
    id,
    payload_text_rendering,
    action,
    ballots,
    reward_event_round,
    failed_timestamp_seconds,
    proposal_creation_timestamp_seconds,
    initial_voting_period_seconds,
    reject_cost_e8s,
    latest_tally,
    wait_for_quiet_deadline_increase_seconds,
    decided_timestamp_seconds,
    is_eligible_for_rewards,
    executed_timestamp_seconds,
    wait_for_quiet_state,
  } = proposalData;

  const proposalInfo = fromNullable(proposal);
  const actionData =
    proposalInfo !== undefined ? fromNullable(proposalInfo.action) : undefined;

  const nsFunction = nsFunctions?.find(({ id }) => id === action);

  const rewardStatus = snsRewardStatus(proposalData);
  const decisionStatus = snsDecisionStatus(proposalData);

  const {
    sns_rewards_status,
    sns_rewards_description,
    sns_status,
    sns_status_description,
  } = get(i18n);

  return {
    // Mapped directly from SnsProposalData directly
    id: fromNullable(id),
    payload_text_rendering: fromNullable(payload_text_rendering),
    action,
    ballots,
    reward_event_round,
    failed_timestamp_seconds,
    proposal_creation_timestamp_seconds,
    initial_voting_period_seconds: initial_voting_period_seconds,
    reject_cost_e8s,
    latest_tally: fromNullable(latest_tally),
    wait_for_quiet_deadline_increase_seconds,
    decided_timestamp_seconds,
    proposer: fromNullable(proposer),
    is_eligible_for_rewards,
    executed_timestamp_seconds,

    // Extracted from SnsProposalData.wait_for_quiet_state
    current_deadline_timestamp_seconds:
      fromNullable(wait_for_quiet_state)?.current_deadline_timestamp_seconds,

    // Extracted from SnsProposalData.proposal
    title: proposalInfo?.title ?? "",
    url: proposalInfo?.url,
    summary: proposalInfo?.summary ?? "",
    actionData,

    // TODO: Ideally this should come from the backend and we didn't need to calculate it
    status: decisionStatus,
    rewardStatus,

    statusString: sns_status[decisionStatus],
    statusDescription: sns_status_description[decisionStatus],
    rewardStatusString: sns_rewards_status[rewardStatus],
    rewardStatusDescription: sns_rewards_description[rewardStatus],
    color: SNS_PROPOSAL_COLOR[decisionStatus],

    // Mapped from Nervous Functions
    type: nsFunction?.name,
    typeDescription: nsFunction?.description[0],
  };
};

/**
 * Returns whether the proposal is accepted or not based on the data.
 *
 * Reference: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L931
 * @param {SnsProposalData} proposal
 * @returns {boolean}
 */
export const isAccepted = ({ latest_tally }: SnsProposalData): boolean => {
  const tally = fromNullable(latest_tally);
  if (tally === undefined) {
    return false;
  }
  return (
    Number(tally.yes) >=
      Number(tally.no) * SNS_MIN_NUMBER_VOTES_FOR_PROPOSAL_RATIO &&
    tally.yes > tally.no
  );
};

/**
 * Returns the decision status of a proposal based on the data.
 *
 * Refecence: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L717
 * @param {SnsProposalData} proposal
 * @returns {SnsProposalDecisionStatus}
 */
export const snsDecisionStatus = (
  proposal: SnsProposalData
): SnsProposalDecisionStatus => {
  const {
    decided_timestamp_seconds,
    executed_timestamp_seconds,
    failed_timestamp_seconds,
  } = proposal;
  if (decided_timestamp_seconds === BigInt(0)) {
    return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN;
  }

  if (isAccepted(proposal)) {
    if (executed_timestamp_seconds > BigInt(0)) {
      return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED;
    }
    if (failed_timestamp_seconds > BigInt(0)) {
      return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED;
    }
    return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED;
  }

  return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED;
};

/**
 * Returns the status of a proposal based on the data.
 *
 * Reference: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L735
 *
 * @param {SnsProposalData} proposal
 * @returns {SnsProposalRewardStatus}
 */
export const snsRewardStatus = ({
  reward_event_round,
  wait_for_quiet_state,
  is_eligible_for_rewards,
}: SnsProposalData): SnsProposalRewardStatus => {
  if (reward_event_round > BigInt(0)) {
    return SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED;
  }

  const now = nowInSeconds();
  const deadline =
    fromNullable(wait_for_quiet_state)?.current_deadline_timestamp_seconds;
  if (!deadline) {
    // Reference: https://github.com/dfinity/ic/blob/226ab04e0984367da356bbe27c90447863d33a27/rs/sns/governance/src/proposal.rs#L760
    throw new Error("Proposal must have a wait_for_quiet_state.");
  }
  if (now < deadline) {
    return SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES;
  }

  if (is_eligible_for_rewards) {
    return SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE;
  }
  return SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED;
};

export const lastProposalId = (
  proposals: SnsProposalData[]
): SnsProposalId | undefined => {
  const last = sortSnsProposalsById(proposals)?.[proposals.length - 1];
  return fromNullable(last?.id ?? []);
};

/**
 * Sort proposals by id in descending order.
 *
 * Returns a new array.
 *
 * @param {SnsProposalData[]} proposals
 * @returns {SnsProposalData[]}
 */
export const sortSnsProposalsById = (
  proposals: SnsProposalData[] | undefined
): SnsProposalData[] | undefined =>
  proposals === undefined
    ? undefined
    : [...proposals].sort(({ id: idA }, { id: idB }) =>
        (fromNullable(idA)?.id ?? BigInt(0)) >
        (fromNullable(idB)?.id ?? BigInt(0))
          ? -1
          : 1
      );

const getAction = (proposal: SnsProposalData): SnsAction | undefined =>
  fromNullable(fromNullable(proposal?.proposal)?.action ?? []);

/**
 * Returns the key of the action in the proposal.
 *
 * An `action` is a variant of the `SnsAction` type.
 * Reference: https://github.com/dfinity/ic-js/blob/8e9695411cab2c9480224baa968743466342ab13/packages/sns/candid/sns_governance.did#L3
 *
 * They variant follows this convetion: { [actionKey: string]: <action data> }
 * Therefore, this function returns the `actionKey`.
 *
 * @param {SnsProposalData} proposal
 * @returns {string} `actionKey` of the action
 */
export const proposalOnlyActionKey = (
  proposal: SnsProposalData
): string | undefined => {
  const actionKeys = Object.keys(getAction(proposal) ?? {});
  // Edge case: Variant of SnsAction has always one key only.
  // We can't test this because an `SnsProposalData` with two action keys is not a valid type.
  if (actionKeys.length > 1) {
    throw new Error("Actions have only have one key.");
  }
  return actionKeys[0];
};

/**
 * Returns a list of tuples with the properties of the action.
 *
 * From the proposal data:
 *  {
 *   id: ...
 *   ...
 *   proposal: [{
 *     title: "title",
 *     summary: "summary",
 *     url: "...",
 *     action: [{
 *       Motion: {
 *         motion_text: "Test motion"
 *       }
 *     }]
 *   }]
 *  }
 * It returns: [["motion_text", "Test motion"]]
 *
 * @param {SnsProposalData} proposal
 * @returns {[string, unknown][]}
 */
export const proposalActionFields = (
  proposal: SnsProposalData
): [string, unknown][] => {
  const key = proposalOnlyActionKey(proposal);
  if (key === undefined) {
    return [];
  }
  // TODO: Convert action types to use `undefined | T` instead of `[] | [T]`.
  const actionData = keyOfOptional({ obj: getAction(proposal), key }) ?? {};
  return Object.entries(actionData).filter(([, value]) => {
    switch (typeof value) {
      case "object":
        return (value && Object.keys(value).length > 0) || Array.isArray(value);
      case "undefined":
      case "string":
      case "bigint":
      case "boolean":
      case "number":
        return true;
    }
    return false;
  });
};

export const snsProposalIdString = (proposal: SnsProposalData): string =>
  fromDefinedNullable(proposal.id).id.toString();

export const snsProposalOpen = (proposal: SnsProposalData): boolean =>
  proposal.decided_timestamp_seconds === 0n;

export const snsNeuronToVotingNeuron = ({
  neuron,
  snsParameters,
}: {
  neuron: SnsNeuron;
  snsParameters: SnsNervousSystemParameters;
}): VotingNeuron => ({
  neuronIdString: getSnsNeuronIdAsHexString(neuron),
  votingPower: BigInt(snsNeuronVotingPower({ neuron, snsParameters })),
});

/** To have the logic in one place */
export const toNnsVote = (vote: SnsVote | Vote): Vote =>
  vote as unknown as Vote;

/** To have the logic in one place */
export const toSnsVote = (vote: SnsVote | Vote): SnsVote =>
  vote as unknown as SnsVote;
