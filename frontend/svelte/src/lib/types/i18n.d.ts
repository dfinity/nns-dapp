/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
  icp: string;
  create: string;
  filter: string;
  back: string;
}

interface I18nError {
  auth_sync: string;
  sign_in: string;
  proposal_not_found: string;
  list_proposals: string;
  list_canisters: string;
  missing_identity: string;
  create_subaccount: string;
  create_subaccount_too_long: string;
  create_subaccount_limit_exceeded: string;
  get_neurons: string;
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

interface I18nNeuron_detail {
  title: string;
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
  navigation: I18nNavigation;
  header: I18nHeader;
  auth: I18nAuth;
  accounts: I18nAccounts;
  neurons: I18nNeurons;
  voting: I18nVoting;
  canisters: I18nCanisters;
  topics: I18nTopics;
  rewards: I18nRewards;
  status: I18nStatus;
  wallet: I18nWallet;
  proposal_detail: I18nProposal_detail;
  neuron_detail: I18nNeuron_detail;
  time: I18nTime;
}
