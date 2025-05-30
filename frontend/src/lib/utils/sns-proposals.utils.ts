import {
  MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER,
  MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER,
} from "$lib/constants/proposals.constants";
import { ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import { i18n } from "$lib/stores/i18n";
import type {
  Filter,
  SnsProposalTopicFilterId,
  SnsProposalTypeFilterId,
} from "$lib/types/filters";
import {
  ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
  ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
} from "$lib/types/filters";
import type {
  BasisPoints,
  UniversalProposalStatus,
  VotingNeuron,
} from "$lib/types/proposals";
import type { SnsTopicKey } from "$lib/types/sns";
import {
  isUnknownTopic,
  type TopicInfoWithUnknown,
} from "$lib/types/sns-aggregator";
import { nowInSeconds } from "$lib/utils/date.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  getTopicInfoBySnsTopicKey,
  snsTopicKeyToTopic,
  snsTopicToTopicKey,
} from "$lib/utils/sns-topics.utils";
import {
  isSnsGenericNervousSystemFunction,
  isSnsNativeNervousSystemFunction,
} from "$lib/utils/sns.utils";
import { basisPointsToPercent } from "$lib/utils/utils";
import { Vote } from "@dfinity/nns";
import type {
  SnsBallot,
  SnsNervousSystemFunction,
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
  type SnsPercentage,
} from "@dfinity/sns";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { get } from "svelte/store";

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

  // Old proposals may not have a topic
  topicKey?: SnsTopicKey;
  topicInfo?: TopicInfoWithUnknown;

  // TODO: Should come from backend
  status: SnsProposalDecisionStatus;
  rewardStatus: SnsProposalRewardStatus;

  // Added by us
  statusString: string;
  statusDescription: string;
  rewardStatusString: string;
  rewardStatusDescription: string;

  // Mapped from Nervous Functions
  type?: string;
  typeDescription?: string;

  minimumYesProportionOfTotal: BasisPoints;
  minimumYesProportionOfExercised: BasisPoints;
};

// TODO: Return also a type and the type description that for now maps to the topic
export const mapProposalInfo = ({
  proposalData,
  nsFunctions,
  topics,
}: {
  proposalData: SnsProposalData;
  nsFunctions: SnsNervousSystemFunction[] | undefined;
  topics: TopicInfoWithUnknown[] | undefined;
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

  const nsFunction = nsFunctions?.find(({ id }) => id === action);

  const rewardStatus = snsRewardStatus(proposalData);
  const decisionStatus = snsDecisionStatus(proposalData);

  const {
    sns_rewards_status,
    sns_rewards_description,
    sns_status,
    sns_status_description,
  } = get(i18n);

  const topic = fromNullable(proposalData?.topic);
  const topicKey = nonNullish(topic) ? snsTopicToTopicKey(topic) : undefined;
  const topicInfo =
    nonNullish(topicKey) && nonNullish(topics)
      ? getTopicInfoBySnsTopicKey({ topicKey, topics })
      : undefined;

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

    // TODO: Ideally this should come from the backend and we didn't need to calculate it
    status: decisionStatus,
    rewardStatus,

    statusString: sns_status[decisionStatus],
    statusDescription: sns_status_description[decisionStatus],
    rewardStatusString: sns_rewards_status[rewardStatus],
    rewardStatusDescription: sns_rewards_description[rewardStatus],

    // Mapped from Nervous Functions
    type: nsFunction?.name,
    typeDescription: nsFunction?.description[0],

    topicKey,
    topicInfo,

    minimumYesProportionOfTotal: minimumYesProportionOfTotal(proposalData),
    minimumYesProportionOfExercised:
      minimumYesProportionOfExercised(proposalData),
  };
};

export const minimumYesProportionOfTotal = (
  proposal: SnsProposalData
): bigint =>
  // `minimum_yes_proportion_of_total` property could be missing in older canister versions
  fromPercentageBasisPoints(proposal.minimum_yes_proportion_of_total ?? []) ??
  MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER;

export const minimumYesProportionOfExercised = (
  proposal: SnsProposalData
): bigint =>
  // `minimum_yes_proportion_of_exercised` property could be missing in older canister versions
  fromPercentageBasisPoints(
    proposal.minimum_yes_proportion_of_exercised ?? []
  ) ?? MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER;

/**
 * Returns whether the proposal is accepted or not based on the data.
 *
 * Reference: https://github.com/dfinity/ic/blob/dc2c20b26eaddb459698e4f9a30e521c21fb3d6e/rs/sns/governance/src/proposal.rs#L1095
 * @param {SnsProposalData} proposal
 * @returns {boolean}
 */
export const isAccepted = (proposal: SnsProposalData): boolean => {
  const { latest_tally } = proposal;
  const tally = fromNullable(latest_tally);

  if (tally === undefined) {
    return false;
  }

  const { yes, no, total } = tally;
  const majorityMet =
    majorityDecision({
      yes,
      no,
      total: yes + no,
      requiredYesOfTotalBasisPoints: minimumYesProportionOfExercised(proposal),
    }) == Vote.Yes;
  const quorumMet =
    yes * 10_000n >= total * minimumYesProportionOfTotal(proposal);

  return quorumMet && majorityMet;
};

// Considers the amount of 'yes' and 'no' voting power in relation to the total voting power,
// based on a percentage threshold that must be met or exceeded for a decision.
// Reference: https://gitlab.com/dfinity-lab/public/ic/-/blob/8db486b531b2993dad9c6eed015f34fc2378fc3e/rs/sns/governance/src/proposal.rs#L1239
const majorityDecision = ({
  yes,
  no,
  total,
  requiredYesOfTotalBasisPoints,
}: {
  yes: bigint;
  no: bigint;
  total: bigint;
  requiredYesOfTotalBasisPoints: bigint;
}): Vote => {
  // 10_000n is 100% in basis points
  const requiredNoOfTotalBasisPoints = 10_000n - requiredYesOfTotalBasisPoints;

  if (yes * 10_000n > total * requiredYesOfTotalBasisPoints) {
    return Vote.Yes;
  } else if (no * 10_000n >= total * requiredNoOfTotalBasisPoints) {
    return Vote.No;
  } else {
    return Vote.Unspecified;
  }
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
  if (decided_timestamp_seconds === 0n) {
    return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN;
  }

  if (isAccepted(proposal)) {
    if (executed_timestamp_seconds > 0n) {
      return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED;
    }
    if (failed_timestamp_seconds > 0n) {
      return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED;
    }
    return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED;
  }

  return SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED;
};

/**
 * Returns the status of a proposal based on the data.
 *
 * Reference: https://github.com/dfinity/ic/blob/bc2c84c5e3dc14bedb7ef9bbe231748886a34a29/rs/sns/governance/src/proposal.rs#L1692-L1706
 *
 * @param {SnsProposalData} proposal
 * @returns {SnsProposalRewardStatus}
 */
export const snsRewardStatus = ({
  reward_event_round,
  wait_for_quiet_state,
  is_eligible_for_rewards,
  reward_event_end_timestamp_seconds,
  proposal_creation_timestamp_seconds,
  initial_voting_period_seconds,
}: SnsProposalData): SnsProposalRewardStatus => {
  if (
    nonNullish(fromNullable(reward_event_end_timestamp_seconds)) ||
    reward_event_round > 0n
  ) {
    return SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED;
  }

  const now = nowInSeconds();
  const deadline =
    fromNullable(wait_for_quiet_state)?.current_deadline_timestamp_seconds ??
    proposal_creation_timestamp_seconds + initial_voting_period_seconds;

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
export const sortSnsProposalsById = <P extends SnsProposalData>(
  proposals: P[] | undefined
): P[] | undefined =>
  proposals === undefined
    ? undefined
    : [...proposals].sort(({ id: idA }, { id: idB }) =>
        (fromNullable(idA)?.id ?? 0n) > (fromNullable(idB)?.id ?? 0n) ? -1 : 1
      );

export const snsProposalIdString = (proposal: SnsProposalData): string =>
  fromDefinedNullable(proposal.id).id.toString();

export const snsProposalId = (proposal: SnsProposalData): bigint =>
  fromDefinedNullable(proposal.id).id;

export const snsProposalAcceptingVotes = (proposal: SnsProposalData): boolean =>
  snsRewardStatus(proposal) ===
  SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES;

/**
 * Returns the voting power of a neuron for a proposal.
 */
export const ballotVotingPower = ({
  proposal,
  neuron,
}: {
  proposal: SnsProposalData;
  neuron: SnsNeuron;
}): bigint =>
  BigInt(
    proposal.ballots.find(
      ([ballotNeuronId]) => ballotNeuronId === getSnsNeuronIdAsHexString(neuron)
    )?.[1].voting_power || 0
  );

export const snsNeuronToVotingNeuron = ({
  neuron,
  proposal,
}: {
  neuron: SnsNeuron;
  proposal: SnsProposalData;
}): VotingNeuron => ({
  neuronIdString: getSnsNeuronIdAsHexString(neuron),
  votingPower: ballotVotingPower({ proposal, neuron }),
});

/** To have the logic in one place */
export const toNnsVote = (vote: SnsVote | Vote): Vote =>
  vote as unknown as Vote;

/** To have the logic in one place */
export const toSnsVote = (vote: SnsVote | Vote): SnsVote =>
  vote as unknown as SnsVote;

export const getUniversalProposalStatus = (
  proposalData: SnsProposalData
): UniversalProposalStatus => {
  const status = snsDecisionStatus(proposalData);
  const statusTypeMap: Record<
    SnsProposalDecisionStatus,
    UniversalProposalStatus
  > = {
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_UNSPECIFIED]: "unknown",
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN]: "open",
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED]: "rejected",
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED]: "adopted",
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED]: "executed",
    [SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED]: "failed",
  };
  const statusType = statusTypeMap[status];

  if (isNullish(statusType)) {
    throw new Error(`Unknown sns proposal status: ${status}`);
  }

  return statusType;
};

/**
 * Returns the proposal type ids that should be excluded from the response.
 * snsFunctions are needed to process "All Generic" entry (when not selected, include all generic ids).
 */
export const toExcludeTypeParameter = ({
  filter,
  snsFunctions,
}: {
  filter: Filter<SnsProposalTypeFilterId>[];
  snsFunctions: SnsNervousSystemFunction[];
}): bigint[] => {
  // If no filter is selected, return all functions
  if (filter.length === 0) {
    return [];
  }
  const nativeNsFunctionIds = snsFunctions
    .filter(isSnsNativeNervousSystemFunction)
    .map(({ id }) => id);
  const isNativeNsFunctionSelected = (nsFunctionId: bigint) =>
    filter.some(({ id, checked }) => id === nsFunctionId.toString() && checked);
  const excludedNativeNsFunctionIds = nativeNsFunctionIds.filter(
    (id) => !isNativeNsFunctionSelected(id)
  );
  const genericNsFunctionIds = snsFunctions
    .filter(isSnsGenericNervousSystemFunction)
    .map(({ id }) => id);
  const isSnsGenericNsFunctionChecked = filter.some(
    ({ id, checked }) => id === ALL_SNS_GENERIC_PROPOSAL_TYPES_ID && checked
  );
  const excludedGenericNsFunctionIds = isSnsGenericNsFunctionChecked
    ? []
    : genericNsFunctionIds;

  return (
    [...excludedNativeNsFunctionIds, ...excludedGenericNsFunctionIds]
      // never exclude { 0n: "All Topics"}
      .filter((id) => id !== ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID)
  );
};

/**
 * Converts topic filter selections to the format required by the list proposals API.
 *
 * - Returns null for ALL_SNS_PROPOSALS_WITHOUT_TOPIC to represent the "All Topics" option in the API
 * - Filters out undefined values (unknown topics) while preserving null values
 * - https://github.com/dfinity/ic/blob/master/rs/sns/governance/src/gen/ic_sns_governance.pb.v1.rs#L3200
 */
export const toIncludeTopicsParameter = (
  topicsFilter: Filter<SnsProposalTopicFilterId>[]
) => {
  return topicsFilter
    .map(({ value }) => {
      if (value === ALL_SNS_PROPOSALS_WITHOUT_TOPIC) return null;
      const topic = snsTopicKeyToTopic(value);
      return isUnknownTopic(topic) ? undefined : topic;
    })
    .filter((topic) => topic !== undefined);
};

// Generate new "types" filter data, but preserve the checked state of the current filter state
// `nsFunctions` can be changed on the backend, and to display recently created proposal types, new entries should be preselected.
export const generateSnsProposalTypesFilterData = ({
  nsFunctions,
  typesFilterState,
  snsName,
}: {
  nsFunctions: SnsNervousSystemFunction[];
  typesFilterState: Filter<SnsProposalTypeFilterId>[];
  snsName: string;
}): Filter<SnsProposalTypeFilterId>[] => {
  // New proposal types are checked by default so only keep unchecked those types that were already unchecked.
  const getCheckedState = (id: string) =>
    typesFilterState.find(({ id: stateId }) => id === stateId)?.checked !==
    false;
  const nativeNsFunctionEntries: Filter<SnsProposalTypeFilterId>[] = nsFunctions
    .filter(isSnsNativeNervousSystemFunction)
    // ignore { 0n: "All Topics"}
    .filter(({ id }) => id !== ALL_SNS_PROPOSAL_TYPES_NS_FUNCTION_ID)
    .map((entry) => ({
      ...entry,
      id: `${entry.id}`,
    }))
    .map(({ id, name }) => ({
      id,
      value: id,
      name: name,
      // New proposal types are checked by default so only keep unchecked those types that were already unchecked.
      checked: getCheckedState(id),
    }));
  const allGenericProposalsLabel = replacePlaceholders(
    get(i18n).sns_types.sns_specific,
    {
      $snsName: snsName,
    }
  );
  const genericNsFunctionEntries: Filter<SnsProposalTypeFilterId>[] =
    nsFunctions.some(isSnsGenericNervousSystemFunction)
      ? // Replace all generic entries w/ a single "All Generic"
        [
          {
            id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
            name: allGenericProposalsLabel,
            checked: getCheckedState(ALL_SNS_GENERIC_PROPOSAL_TYPES_ID),
          },
        ]
      : [];
  return [...nativeNsFunctionEntries, ...genericNsFunctionEntries];
};

export const fromPercentageBasisPoints = (
  value: [] | [SnsPercentage]
): bigint | undefined => {
  const percentage = fromNullable(value);
  return isNullish(percentage)
    ? undefined
    : fromNullable(percentage.basis_points);
};

// Is a proposal with variable voting-participation thresholds
export const isCriticalProposal = (immediateMajorityPercent: number): boolean =>
  immediateMajorityPercent !==
  basisPointsToPercent(MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER);

export const generateSnsProposalTopicsFilterData = ({
  topics,
  filters,
}: {
  topics: TopicInfoWithUnknown[];
  filters: Filter<SnsProposalTopicFilterId>[];
}): Filter<SnsProposalTopicFilterId>[] => {
  if (topics.length === 0) return [];

  // TODO: Extract and reuse
  const getCheckedState = (filterId: string) =>
    filters.find(({ id }) => id === filterId)?.checked !== false;

  const i18nKeys = get(i18n);

  const existingFilters: Filter<SnsProposalTopicFilterId>[] = topics
    .filter(({ topic }) => nonNullish(topic))
    .map((topicInfo) => {
      const topic = snsTopicToTopicKey(fromDefinedNullable(topicInfo.topic));
      const name = fromDefinedNullable(topicInfo.name);
      const isCritical = fromDefinedNullable(topicInfo.is_critical);
      const checked = getCheckedState(topic);

      return {
        name,
        isCritical,
        id: topic,
        value: topic,
        checked,
      };
    });

  const allSnsProposalsWithoutTopicFilter = {
    id: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
    value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
    name: i18nKeys.voting.all_sns_proposals_without_topic,
    checked: getCheckedState(ALL_SNS_PROPOSALS_WITHOUT_TOPIC),
  };
  return [...existingFilters, allSnsProposalsWithoutTopicFilter];
};
