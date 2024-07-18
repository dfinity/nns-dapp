import { SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { enumValues } from "$lib/utils/enum.utils";
import { Topic } from "@dfinity/nns";

export const ULPS_PER_MATURITY = 100_000_000;
export const MAX_NEURONS_MERGED = 2;
export const MIN_NEURON_STAKE = 100_000_000n;
export const MAX_CONCURRENCY = 10;
export const MATURITY_MODULATION_VARIANCE_PERCENTAGE = 0.95;
// Neuron ids are random u64. Max digits of a u64 is 20.
export const MAX_NEURON_ID_DIGITS = 20;

export const DISSOLVE_DELAY_MULTIPLIER = 1;
export const AGE_MULTIPLIER = 0.25;
export const NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE = SECONDS_IN_HALF_YEAR;

const FIRST_TOPICS = [
  Topic.Unspecified,
  Topic.Governance,
  Topic.SnsAndCommunityFund,
];
const LAST_TOPICS = [Topic.ExchangeRate];

// Topics that neurons cannot yet set following for.
// TODO: Remove this list when the NNS Governance supports following on those topics.
export const TOPICS_WITH_FOLLOWING_DISABLED = [
  Topic.ProtocolCanisterManagement,
  Topic.ServiceNervousSystemManagement,
];

// This list should include ALL topics ordered as we want.
// Filtering out topics is done in the utils.
export const TOPICS_TO_FOLLOW_NNS = [
  ...FIRST_TOPICS,
  // We add all the topics that are not in the first or last topics
  ...enumValues(Topic).filter(
    (topic) => ![...FIRST_TOPICS, ...LAST_TOPICS].includes(topic)
  ),
  ...LAST_TOPICS,
];
