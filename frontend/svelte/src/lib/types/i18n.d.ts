/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
  icp: string;
  create: string;
  filter: string;
  back: string;
  confirm_yes: string;
  confirm_no: string;
  yes: string;
  no: string;
  unspecified: string;
}

interface I18nError {
  auth_sync: string;
  sign_in: string;
  proposal_not_found: string;
  neuron_not_found: string;
  list_proposals: string;
  list_canisters: string;
  missing_identity: string;
  create_subaccount: string;
  create_subaccount_too_long: string;
  create_subaccount_limit_exceeded: string;
  get_neurons: string;
  get_known_neurons: string;
  register_vote: string;
  register_vote_unknown: string;
  add_followee: string;
  remove_followee: string;
  followee_does_not_exist: string;
  accounts_not_found: string;
}

interface I18nWarning {
  auth_sign_out: string;
}

interface I18nNavigation {
  icp: string;
  neurons: string;
  voting: string;
  canisters: string;
}

interface I18nHeader {
  title: string;
  logout: string;
}

interface I18nAuth {
  ic: string;
  nns: string;
  icp_governance: string;
  login: string;
  powered_by: string;
}

interface I18nAccounts {
  title: string;
  main: string;
  copy_identifier: string;
  new_transaction: string;
  add_account: string;
  new_linked_title: string;
  new_linked_subtitle: string;
  attach_hardware_title: string;
  attach_hardware_subtitle: string;
  new_linked_account_title: string;
  new_linked_account_placeholder: string;
}

interface I18nNeurons {
  title: string;
  text: string;
  principal_is: string;
  stake_neurons: string;
  select_source: string;
  set_dissolve_delay: string;
  confirm_dissolve_delay: string;
  follow_neurons_screen: string;
  my_accounts: string;
  stake_neuron: string;
  source: string;
  transaction_fee: string;
  current_balance: string;
  may_take_while: string;
  amount: string;
  max: string;
  create: string;
  status_locked: string;
  status_unspecified: string;
  status_dissolved: string;
  status_dissolving: string;
  community_fund: string;
  hotkey_control: string;
  stake: string;
  icp_stake: string;
  staked: string;
  aria_label_neuron_card: string;
  neuron_id: string;
  neuron_balance: string;
  current_dissolve_delay: string;
  dissolve_delay_title: string;
  no_delay: string;
  dissolve_delay_description: string;
  voting_power: string;
  skip: string;
  update_delay: string;
  confirm_delay: string;
}

interface I18nNew_followee {
  title: string;
  address_placeholder: string;
  follow_neuron: string;
  options_title: string;
  follow: string;
  unfollow: string;
  success_add_followee: string;
  success_remove_followee: string;
}

interface I18nFollow_neurons {
  description: string;
  topic_0_title: string;
  topic_0_subtitle: string;
  topic_1_title: string;
  topic_1_subtitle: string;
  topic_2_title: string;
  topic_2_subtitle: string;
  topic_3_title: string;
  topic_3_subtitle: string;
  topic_4_title: string;
  topic_4_subtitle: string;
  topic_5_title: string;
  topic_5_subtitle: string;
  topic_6_title: string;
  topic_6_subtitle: string;
  topic_7_title: string;
  topic_7_subtitle: string;
  topic_8_title: string;
  topic_8_subtitle: string;
  topic_9_title: string;
  topic_9_subtitle: string;
  topic_10_title: string;
  topic_10_subtitle: string;
  current_followees: string;
  add: string;
}

interface I18nVoting {
  title: string;
  text: string;
  topics: string;
  rewards: string;
  status: string;
  hide_unavailable_proposals: string;
  nothing_found: string;
}

interface I18nCanisters {
  title: string;
  text: string;
  step1: string;
  step2: string;
  step3: string;
  principal_is: string;
  create_or_link: string;
}

interface I18nTopics {
  Unspecified: string;
  ManageNeuron: string;
  ExchangeRate: string;
  NetworkEconomics: string;
  Governance: string;
  NodeAdmin: string;
  ParticipantManagement: string;
  SubnetManagement: string;
  NetworkCanisterManagement: string;
  Kyc: string;
  NodeProviderRewards: string;
}

interface I18nRewards {
  PROPOSAL_REWARD_STATUS_UNKNOWN: string;
  PROPOSAL_REWARD_STATUS_ACCEPT_VOTES: string;
  PROPOSAL_REWARD_STATUS_READY_TO_SETTLE: string;
  PROPOSAL_REWARD_STATUS_SETTLED: string;
  PROPOSAL_REWARD_STATUS_INELIGIBLE: string;
}

interface I18nStatus {
  PROPOSAL_STATUS_UNKNOWN: string;
  PROPOSAL_STATUS_OPEN: string;
  PROPOSAL_STATUS_REJECTED: string;
  PROPOSAL_STATUS_ACCEPTED: string;
  PROPOSAL_STATUS_EXECUTED: string;
  PROPOSAL_STATUS_FAILED: string;
}

interface I18nWallet {
  title: string;
}

interface I18nProposal_detail {
  title: string;
  summary: string;
  topic_prefix: string;
  id_prefix: string;
  proposer_prefix: string;
  adopt: string;
  reject: string;
  my_votes: string;
}

interface I18nProposal_detail__vote {
  headline: string;
  neurons: string;
  voting_power: string;
  total: string;
  adopt: string;
  reject: string;
  confirm_adopt_headline: string;
  confirm_adopt_text: string;
  confirm_reject_headline: string;
  confirm_reject_text: string;
}

interface I18nProposal_detail__ineligible {
  headline: string;
  text: string;
  reason_since: string;
  reason_short: string;
}

interface I18nNeuron_detail {
  title: string;
  proposer: string;
  voting_history: string;
  vote: string;
}

interface I18nTime {
  year: string;
  year_plural: string;
  day: string;
  day_plural: string;
  hour: string;
  hour_plural: string;
  minute: string;
  minute_plural: string;
}

interface I18n {
  lang: Languages;
  core: I18nCore;
  error: I18nError;
  warning: I18nWarning;
  navigation: I18nNavigation;
  header: I18nHeader;
  auth: I18nAuth;
  accounts: I18nAccounts;
  neurons: I18nNeurons;
  new_followee: I18nNew_followee;
  follow_neurons: I18nFollow_neurons;
  voting: I18nVoting;
  canisters: I18nCanisters;
  topics: I18nTopics;
  rewards: I18nRewards;
  status: I18nStatus;
  wallet: I18nWallet;
  proposal_detail: I18nProposal_detail;
  proposal_detail__vote: I18nProposal_detail__vote;
  proposal_detail__ineligible: I18nProposal_detail__ineligible;
  neuron_detail: I18nNeuron_detail;
  time: I18nTime;
}
