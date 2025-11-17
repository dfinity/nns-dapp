import {
  SECONDS_IN_7_DAYS,
  SECONDS_IN_HALF_YEAR,
} from "$lib/constants/constants";
import { enumValues } from "$lib/utils/enum.utils";
import { Topic } from "@dfinity/nns";

export const ULPS_PER_MATURITY = 100_000_000;
export const MAX_NEURONS_MERGED = 2;
export const MIN_NEURON_STAKE = 100_000_000n;
export const MAX_CONCURRENCY = 10;
export const MATURITY_MODULATION_VARIANCE_PERCENTAGE = 0.95;
// The minimum amount of ICP to disburse in a single transaction.
// https://github.com/dfinity/ic/blob/b9c23dd08c76349a3dd1b422e39988bea8363d33/rs/nns/governance/src/governance/disburse_maturity.rs#L29
export const MINIMUM_DISBURSEMENT = 100_000_000n;
// The API will reject new disbursement requests if there are already 10 disbursements in progress.
// https://github.com/dfinity/ic/blob/3564b37939f037ba4d051ada88251c13954597d2/rs/nns/governance/src/governance/disburse_maturity.rs#L40-L42
export const MAX_DISBURSEMENTS_IN_PROGRESS = 10;
// The minimum maturity to disburse with the maturity modulation variance applied.
export const MIN_DISBURSEMENT_WITH_VARIANCE = BigInt(
  Math.round(
    Number(MINIMUM_DISBURSEMENT) / MATURITY_MODULATION_VARIANCE_PERCENTAGE
  )
);
// The minimum maturity ICP equivalent to disburse with the maturity modulation variance applied.
export const MIN_DISBURSEMENT_WITH_VARIANCE_ICP =
  Number(MINIMUM_DISBURSEMENT) /
  ULPS_PER_MATURITY /
  MATURITY_MODULATION_VARIANCE_PERCENTAGE;

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

// To notify users that their rewards will start decreasing in 30 days.
export const NOTIFICATION_PERIOD_BEFORE_REWARD_LOSS_STARTS_DAYS = 30;
