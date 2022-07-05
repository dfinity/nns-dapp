/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
  remove: string;
  icp: string;
  create: string;
  filter: string;
  back: string;
  confirm_yes: string;
  confirm_no: string;
  confirm: string;
  cancel: string;
  yes: string;
  no: string;
  unspecified: string;
  continue: string;
  amount: string;
  max: string;
  principal: string;
  toggle: string;
  log: string;
  principal_id: string;
  copy: string;
  badgeNew: string;
}

interface I18nError {
  auth_sync: string;
  sign_in: string;
  proposal_not_found: string;
  proposal_payload: string;
  proposal_payload_not_found: string;
  neuron_not_found: string;
  neuron_load: string;
  list_proposals: string;
  list_canisters: string;
  missing_identity: string;
  rename_subaccount: string;
  rename_subaccount_no_account: string;
  rename_subaccount_type: string;
  get_neurons: string;
  get_known_neurons: string;
  register_vote: string;
  register_vote_neuron: string;
  register_vote_unknown: string;
  add_followee: string;
  remove_followee: string;
  followee_does_not_exist: string;
  accounts_not_found: string;
  account_not_found: string;
  transactions_not_found: string;
  canister_not_found: string;
  fail: string;
  join_community_fund: string;
  dummy_proposal: string;
  update_delay: string;
  unknown: string;
  amount_not_valid: string;
  amount_not_enough_stake_neuron: string;
  stake_neuron: string;
  transaction_invalid_amount: string;
  transaction_no_source_account: string;
  transaction_no_destination_address: string;
  transaction_error: string;
  unexpected_number_neurons_merge: string;
  cannot_merge: string;
  split_neuron: string;
  not_authorized_neuron_action: string;
  invalid_sender: string;
  insufficient_funds: string;
  transfer_error: string;
  merge_neurons_same_id: string;
  merge_neurons_not_same_controller: string;
  merge_neurons_not_same_manage_neuron_followees: string;
  governance_error: string;
  not_mergeable: string;
  invalid_account_id: string;
  address_not_valid: string;
  invalid_percentage: string;
  principal_not_valid: string;
  input_length: string;
  not_canister_controller: string;
  canister_details_not_found: string;
  controller_already_present: string;
  controller_not_present: string;
  pub_key_not_hex_string: string;
  pub_key_hex_string_invalid_length: string;
  hardware_wallet_no_account: string;
  canister_refund: string;
  canister_creation_unknown: string;
  canister_top_up_unknown: string;
  canister_update_settings: string;
  not_canister_controller_to_update: string;
  limit_exceeded_topping_up_canister: string;
  limit_exceeded_creating_canister: string;
  canister_invalid_transaction: string;
}

interface I18nWarning {
  auth_sign_out: string;
}

interface I18nNavigation {
  accounts: string;
  neurons: string;
  voting: string;
  canisters: string;
  launchpad: string;
}

interface I18nHeader {
  menu: string;
  title: string;
  logout: string;
  account_menu: string;
}

interface I18nAuth {
  ic: string;
  nns: string;
  icp_governance: string;
  login: string;
  on_chain: string;
}

interface I18nAccounts {
  title: string;
  main: string;
  main_account: string;
  new_transaction: string;
  add_account: string;
  new_linked_title: string;
  new_linked_subtitle: string;
  attach_hardware_title: string;
  attach_hardware_subtitle: string;
  attach_hardware_name_placeholder: string;
  attach_hardware_enter_name: string;
  attach_hardware_show_neurons: string;
  attach_hardware_neurons_text: string;
  attach_hardware_neurons_add: string;
  attach_hardware_neurons_added: string;
  connect_hardware_wallet: string;
  connect_hardware_wallet_text: string;
  show_info_hardware_wallet: string;
  attach_wallet: string;
  hardware_wallet_connected: string;
  new_linked_account_enter_name: string;
  new_linked_account_placeholder: string;
  subAccount: string;
  hardwareWallet: string;
  select_source: string;
  select_destination: string;
  address: string;
  enter_address_or_select: string;
  my_accounts: string;
  enter_icp_amount: string;
  source: string;
  destination: string;
  hardware_wallet_text: string;
  transaction_fee: string;
  review_transaction: string;
  current_balance: string;
  confirm_and_send: string;
  account_identifier: string;
  transaction_success: string;
  rename: string;
  rename_linked_account: string;
  rename_new_name_placeholder: string;
  rename_account_enter_new_name: string;
  hardware_wallet_add_hotkey_title: string;
  hardware_wallet_add_hotkey_text_neuron: string;
  hardware_wallet_add_hotkey_text_principal: string;
  hardware_wallet_add_hotkey_text_confirm: string;
  current_balance_detail: string;
}

interface I18nNeurons {
  title: string;
  text: string;
  principal_is: string;
  stake_neurons: string;
  merge_neurons: string;
  merge_neurons_modal_title: string;
  merge_neurons_modal_confirm: string;
  merge_neurons_modal_merge_button: string;
  merge_neurons_modal_title_2: string;
  merge_neurons_modal_with: string;
  set_dissolve_delay: string;
  add_user_as_hotkey: string;
  add_user_as_hotkey_message: string;
  add_user_as_hotkey_success: string;
  remove_hotkey_success: string;
  neuron_create_success: string;
  your_principal: string;
  confirm_dissolve_delay: string;
  follow_neurons_screen: string;
  stake_neuron: string;
  source: string;
  transaction_fee: string;
  current_balance: string;
  may_take_while: string;
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
  remaining: string;
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
  set_delay: string;
  confirm_update_delay: string;
  confirm_set_delay: string;
  merge_neurons_article_title: string;
  cannot_merge_neuron_community: string;
  cannot_merge_neuron_hotkey: string;
  cannot_merge_hardware_wallet: string;
  only_merge_two: string;
  need_two_to_merge: string;
  irreversible_action: string;
  claim_seed_neurons_success: string;
  stake_amount: string;
}

interface I18nNew_followee {
  title: string;
  address_placeholder: string;
  follow_neuron: string;
  options_title: string;
  follow: string;
  unfollow: string;
  same_neuron: string;
  already_followed: string;
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
  principal_is: string;
  create_or_link: string;
  empty: string;
  add_canister: string;
  create_canister_title: string;
  create_canister_subtitle: string;
  create_canister_success: string;
  link_canister_title: string;
  link_canister_subtitle: string;
  link_canister_success: string;
  attach_canister: string;
  enter_canister_id: string;
  canister_id: string;
  enter_amount: string;
  review_create_canister: string;
  t_cycles: string;
  minimum_cycles_text_1: string;
  minimum_cycles_text_2: string;
  transaction_fee: string;
  review_cycles_purchase: string;
  converted_to: string;
}

interface I18nCanister_detail {
  title: string;
  id: string;
  cycles: string;
  controllers: string;
  t_cycles: string;
  add_cycles: string;
  top_up_canister: string;
  top_up_successful: string;
  detach: string;
  confirm_detach_title: string;
  confirm_detach_description_1: string;
  confirm_detach_description_2: string;
  confirm_remove_controller_title: string;
  confirm_remove_controller_description: string;
  confirm_remove_controller_user_description_1: string;
  confirm_remove_controller_user_description_2: string;
  confirm_remove_last_controller_description: string;
  detach_success: string;
  confirm_new_controller: string;
  enter_controller: string;
  new_controller: string;
  add_controller: string;
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

interface I18nTransaction_names {
  receive: string;
  send: string;
  mint: string;
  burn: string;
  stakeNeuron: string;
  stakeNeuronNotification: string;
  topUpNeuron: string;
  createCanister: string;
  topUpCanister: string;
}

interface I18nWallet {
  title: string;
  address: string;
  principal: string;
  direction_from: string;
  direction_to: string;
  no_transactions: string;
}

interface I18nBusy_screen {
  pending_approval_hw: string;
  take_long: string;
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
  loading_neurons: string;
  unknown_nns_function: string;
  nns_function_name: string;
  payload: string;
  summary_toggle_view: string;
}

interface I18nProposal_detail__vote {
  headline: string;
  neurons: string;
  voting_power: string;
  vote_progress: string;
  total: string;
  adopt: string;
  reject: string;
  confirm_adopt_headline: string;
  confirm_adopt_text: string;
  confirm_reject_headline: string;
  confirm_reject_text: string;
  vote_status: string;
  accept_or_reject: string;
  cast_vote_neuronId: string;
  cast_vote_votingPower: string;
}

interface I18nProposal_detail__ineligible {
  headline: string;
  text: string;
  reason_since: string;
  reason_short: string;
}

interface I18nNns_function_names {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  13: string;
  14: string;
  15: string;
  16: string;
  17: string;
  18: string;
  19: string;
  20: string;
  21: string;
  22: string;
  23: string;
  24: string;
  25: string;
  26: string;
  27: string;
  28: string;
  29: string;
}

interface I18nNeuron_detail {
  title: string;
  voting_history: string;
  vote: string;
  join_community_fund: string;
  increase_dissolve_delay: string;
  start_dissolving: string;
  stop_dissolving: string;
  disburse: string;
  increase_stake: string;
  split_neuron: string;
  voting_power_tooltip: string;
  join_community_fund_description: string;
  maturity_title: string;
  merge_maturity: string;
  merge: string;
  spawn_neuron: string;
  spawn: string;
  maturity_tooltip: string;
  start_dissolve_description: string;
  stop_dissolve_description: string;
  join_community_fund_success: string;
  dummy_proposal_success: string;
  following_title: string;
  following_description: string;
  follow_neurons: string;
  no_ballots: string;
  split_neuron_confirm: string;
  merge_neurons_success: string;
  disburse_neuron_title: string;
  split_neuron_success: string;
  split_neuron_disabled_tooltip: string;
  merge_maturity_disabled_tooltip: string;
  spawn_maturity_disabled_tooltip: string;
  hotkeys_title: string;
  add_hotkey: string;
  no_notkeys: string;
  add_hotkey_modal_title: string;
  enter_hotkey: string;
  remove_hotkey_success: string;
  invalid_hotkey: string;
  disburse_success: string;
  merge_maturity_modal_title: string;
  merge_confirmation_modal_title: string;
  merge_maturity_modal_description: string;
  merge_maturity_confirmation_q: string;
  merge_maturity_confirmation_a: string;
  merge_maturity_success: string;
  spawn_maturity_modal_title: string;
  spawn_confirmation_modal_title: string;
  spawn_maturity_modal_description: string;
  spawn_maturity_success: string;
  spawn_maturity_confirmation_q: string;
  spawn_maturity_confirmation_a: string;
  current_stake: string;
  current_maturity: string;
  dissolve_delay_range: string;
  maturity_range: string;
  maturity_percentage: string;
}

interface I18nSns_launchpad {
  header: string;
  projects: string;
  no_projects: string;
  proposals: string;
  project_logo: string;
  no_proposals: string;
}

interface I18nSns_project {
  project: string;
  deadline: string;
  your_commitment: string;
}

interface I18nSns_project_detail {
  token_name: string;
  token_symbol: string;
  min_commitment: string;
  max_commitment: string;
  current_commitment: string;
  min_commitment_goal: string;
  deadline: string;
  user_commitment: string;
  status: string;
  accepting: string;
  enter_amount: string;
  closed: string;
  pending: string;
  participate: string;
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

interface I18nError__ledger {
  unexpected: string;
  please_open: string;
  locked: string;
  fetch_public_key: string;
  principal_not_match: string;
  signature_unexpected: string;
  signature_length: string;
  connect_no_device: string;
  connect_many_apps: string;
  connect_not_supported: string;
  unexpected_wallet: string;
  user_cancel: string;
  user_rejected_transaction: string;
  version_not_supported: string;
  browser_not_supported: string;
  incorrect_identifier: string;
}

interface I18nError__attach_wallet {
  unexpected: string;
  connect: string;
  no_name: string;
  no_identity: string;
  already_registered: string;
  limit_exceeded: string;
  register_hardware_wallet: string;
  create_hardware_wallet_too_long: string;
}

interface I18nError__account {
  not_found: string;
  no_details: string;
  subaccount_too_long: string;
  create_subaccount_limit_exceeded: string;
  create_subaccount: string;
  subaccount_not_found: string;
  rename_account_not_found: string;
}

interface I18nError__canister {
  already_attached: string;
  name_taken: string;
  name_too_long: string;
  limit_exceeded: string;
  detach_not_found: string;
  unknown_attach: string;
  unknown_detach: string;
  get_exchange_rate: string;
}

interface I18nTheme {
  theme: string;
  switch_theme: string;
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
  canister_detail: I18nCanister_detail;
  topics: I18nTopics;
  rewards: I18nRewards;
  status: I18nStatus;
  transaction_names: I18nTransaction_names;
  wallet: I18nWallet;
  busy_screen: I18nBusy_screen;
  proposal_detail: I18nProposal_detail;
  proposal_detail__vote: I18nProposal_detail__vote;
  proposal_detail__ineligible: I18nProposal_detail__ineligible;
  nns_function_names: I18nNns_function_names;
  neuron_detail: I18nNeuron_detail;
  sns_launchpad: I18nSns_launchpad;
  sns_project: I18nSns_project;
  sns_project_detail: I18nSns_project_detail;
  time: I18nTime;
  error__ledger: I18nError__ledger;
  error__attach_wallet: I18nError__attach_wallet;
  error__account: I18nError__account;
  error__canister: I18nError__canister;
  theme: I18nTheme;
}
