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

// Export from the known neurons dashboard order
export const KNOWN_NEURONS_ORDER_DASHBOARD = [
  "27",
  "4966884161088437903",
  "14231996777861930328",
  "428687636340283207",
  "10843833286193887500",
  "55674167450360693",
  "12860062727199510685",
  "8959053254051540391",
  "6362091663310642824",
  "8777656085298269769",
  "5728549712200490799",
  "13538714184009896865",
  "12911334408382674412",
  "13765488517578645474",
  "5944070935127277981",
  "11053086394920719168",
  "16335946240875077438",
  "11595773061053702367",
  "5553849921138062661",
  "16737374299031693047",
  "2649066124191664356",
  "10323780370508631162",
  "6914974521667616512",
  "11974742799838195634",
  "17682165960669268263",
  "4714336137769716208",
  "1767081890685465163",
  "2776371642396604393",
  "5132308922522452058",
  "7902983898778678943",
  "433047053926084807",
  "1100477100620240869",
  "7446549063176501841",
  "8571487073262291504",
  "16459595263909468577",
  "16122208542864232355",
  "3172308420039087400",
  "12093733865587997066",
  "4713806069430754115",
  "16673157401414569992",
  "3099449518038519101",
  "5371276303191057244",
  "33138099823745946",
  "12977943926061800402",
  "1637856224910350276",
  "2334327054503903846",
  "10389857423811734339",
  "18422777432977120264",
  "18363645821499695760",
  "2947465672511369",
  "4069412273344914316",
  "16405079610149095765",
  "16781982801159042389",
];
