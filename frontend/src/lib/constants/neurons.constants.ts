import {
  SECONDS_IN_7_DAYS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { enumValues } from "$lib/utils/enum.utils";
import { Topic } from "@dfinity/nns";

export const ULPS_PER_MATURITY = 100_000_000;
export const MAX_NEURONS_MERGED = 2;
export const MIN_NEURON_STAKE = 100_000_000n;
export const MAX_CONCURRENCY = 10;
export const MATURITY_MODULATION_VARIANCE_PERCENTAGE = 0.95;
// Neuron ids are random u64. Max digits of a u64 is 20.
export const MAX_NEURON_ID_DIGITS = 20;

export const MAX_DISSOLVE_DELAY_BONUS = 1; // = +100%
export const MAX_AGE_BONUS = 0.25; // = +25%
export const NNS_MINIMUM_DISSOLVE_DELAY = SECONDS_IN_7_DAYS;
export const NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE = SECONDS_IN_HALF_YEAR;

const FIRST_TOPICS = [
  Topic.Unspecified,
  Topic.Governance,
  Topic.SnsAndCommunityFund,
];
const LAST_TOPICS = [Topic.ExchangeRate];

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

// If a neuron has not "refreshed" (manual voting or a following update) its voting power after this amount of time,
// its deciding voting power starts decreasing linearly.
const START_REDUCING_VOTING_POWER_AFTER_SECONDS = SECONDS_IN_HALF_YEAR;
// After how many seconds from the start of voting power decrease,
// a neuron followings (all topics other than NeuronManagement) will be cleared.
const CLEAR_FOLLOWING_AFTER_SECONDS = SECONDS_IN_MONTH;
