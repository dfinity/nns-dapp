/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
  remove: string;
  icp: string;
  create: string;
  filter: string;
  filter_select_all: string;
  filter_clear_all: string;
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
  min: string;
  principal: string;
  toggle: string;
  log: string;
  principal_id: string;
  ic: string;
  next: string;
  principal_is: string;
  this_may_take_a_few_minutes: string;
  do_not_close: string;
  finish: string;
  expand_all: string;
  receive_with_token: string;
  receive: string;
  send_with_token: string;
  collapse_all: string;
  or: string;
  add: string;
  not_applicable: string;
  view_more: string;
  copy: string;
  copied: string;
}

interface I18nError {
  auth_sync: string;
  sign_in: string;
  proposal_not_found: string;
  proposal_payload: string;
  proposal_payload_not_found: string;
  neuron_not_found: string;
  neuron_spawning: string;
  neuron_load: string;
  sns_neurons_load: string;
  accounts_load: string;
  sns_accounts_balance_load: string;
  icrc_token_load: string;
  list_proposals: string;
  list_proposals_payload_too_large: string;
  get_proposal: string;
  wrong_proposal_id: string;
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
  followee_does_not_exist: string;
  accounts_not_found: string;
  query_balance: string;
  accounts_not_found_poll: string;
  account_not_found: string;
  account_not_reload: string;
  canister_not_found: string;
  fail: string;
  dummy_proposal: string;
  unlock_neuron: string;
  add_maturity: string;
  update_neuron: string;
  unknown: string;
  amount_not_valid: string;
  amount_not_enough_stake_neuron: string;
  amount_not_enough_top_up_neuron: string;
  transaction_error: string;
  transaction_too_old: string;
  transaction_created_in_future: string;
  unexpected_number_neurons_merge: string;
  cannot_merge: string;
  not_authorized_neuron_action: string;
  invalid_sender: string;
  insufficient_funds: string;
  transfer_error: string;
  merge_neurons_same_id: string;
  merge_neurons_not_same_controller: string;
  merge_neurons_not_same_manage_neuron_followees: string;
  merge_neurons_different_types: string;
  neuron_account_not_found: string;
  governance_error: string;
  not_mergeable: string;
  invalid_account_id: string;
  address_not_valid: string;
  address_not_icp_icrc_valid: string;
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
  high_load_retrying: string;
  canister_refund: string;
  canister_creation_unknown: string;
  canister_top_up_unknown: string;
  canister_update_settings: string;
  not_canister_controller_to_update: string;
  limit_exceeded_topping_up_canister: string;
  limit_exceeded_creating_canister: string;
  limit_exceeded_getting_open_ticket: string;
  transaction_fee_not_found: string;
  token_not_found: string;
  fetch_transactions: string;
  transaction_data: string;
  amount_not_enough_stake_sns_neuron: string;
  adding_permissions: string;
  canister_invalid_transaction: string;
  qrcode_camera_error: string;
  qrcode_token_incompatible: string;
  invalid_ledger_index_pair: string;
  index_canister_validation: string;
  refresh_voting_power: string;
  unknown_topic_title: string;
  unknown_proposal_status_title: string;
  canister_tooltip: string;
}

interface I18nWarning {
  auth_sign_out: string;
  proposal_fetch_limit: string;
  test_env_note: string;
  test_env_confirm: string;
  test_env_title: string;
}

interface I18nNavigation {
  tokens: string;
  tokens_account: string;
  canisters: string;
  neurons: string;
  neurons_account: string;
  voting: string;
  launchpad: string;
  manage_ii: string;
  source_code: string;
  settings: string;
  reporting: string;
  portfolio: string;
  privacy_mode_hide: string;
  privacy_mode_show: string;
  project_page: string;
}

interface I18nAlfred {
  no_results: string;
  home_title: string;
  home_description: string;
  tokens_title: string;
  tokens_description: string;
  neurons_title: string;
  neurons_description: string;
  voting_title: string;
  voting_description: string;
  launchpad_title: string;
  launchpad_description: string;
  reporting_title: string;
  reporting_description: string;
  canisters_title: string;
  canisters_description: string;
  settings_title: string;
  settings_description: string;
  principalId_title: string;
  principalId_description: string;
  dark_theme_title: string;
  dark_theme_description: string;
  light_theme_title: string;
  light_theme_description: string;
  log_in_title: string;
  log_in_description: string;
  log_out_title: string;
  log_out_description: string;
}

interface I18nHeader {
  menu: string;
  logout: string;
  account_menu: string;
  main_icp_account_id: string;
  account_id_tooltip: string;
}

interface I18nReporting {
  neurons_title: string;
  neurons_description: string;
  neurons_download: string;
  transactions_title: string;
  transactions_description: string;
  transactions_download: string;
  busy_screen: string;
  principal_account_id: string;
  date_label: string;
  neuron_id: string;
  project: string;
  symbol: string;
  neuron_account_id: string;
  controller_id: string;
  stake: string;
  available_maturity: string;
  staked_maturity: string;
  dissolve_delay: string;
  dissolve_date: string;
  creation_date: string;
  state: string;
  account_id: string;
  account_name: string;
  amount: string;
  balance: string;
  from: string;
  numer_of_transactions: string;
  timestamp: string;
  to: string;
  transaction_id: string;
  transaction_type: string;
  error_csv_generation: string;
  error_file_system_access: string;
  error_neurons: string;
  error_transactions: string;
  range_filter_title: string;
  range_filter_all: string;
  range_last_year: string;
  range_year_to_date: string;
}

interface I18nAuth {
  login: string;
  ic_logo: string;
}

interface I18nAccounts {
  main: string;
  balance: string;
  send: string;
  buy_icp: string;
  buy_icp_banxa: string;
  receiving_icp_address: string;
  icp_token_utility: string;
  buy_icp_description: string;
  buy_icp_note: string;
  banxa_logo_alt: string;
  icp_transaction_description: string;
  sns_transaction_description: string;
  ckbtc_transaction_description: string;
  ckbtc_to_btc_transaction_description: string;
  add_account: string;
  new_account_title: string;
  new_linked_subtitle: string;
  attach_hardware_title: string;
  attach_hardware_subtitle: string;
  attach_hardware_name_placeholder: string;
  attach_hardware_enter_name: string;
  attach_hardware_description: string;
  attach_hardware_show_neurons: string;
  attach_hardware_neurons_text: string;
  attach_hardware_neurons_add: string;
  attach_hardware_neurons_added: string;
  connect_hardware_wallet: string;
  connect_hardware_wallet_text: string;
  show_info_hardware_wallet: string;
  edit_name: string;
  new_linked_account_enter_name: string;
  new_linked_account_placeholder: string;
  hardwareWallet: string;
  select_source: string;
  address: string;
  source: string;
  destination: string;
  from: string;
  to_address: string;
  hardware_wallet_text: string;
  token_transaction_fee: string;
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
  description: string;
  edit_transaction: string;
  send_now: string;
  select: string;
  manual: string;
  scan_qr_code_alt: string;
  scan_qr_code: string;
  current_balance_detail: string;
  network: string;
  network_icp: string;
  network_btc_mainnet: string;
  network_btc_testnet: string;
  select_network: string;
  bitcoin_transaction_fee_notice: string;
  estimated_bitcoin_transaction_fee: string;
  internetwork_fee_notice: string;
  estimated_internetwork_fee: string;
  estimation_notice: string;
  receive_account: string;
  sending_amount: string;
  total_deducted: string;
  received_amount: string;
  received_amount_notice: string;
  transaction_time: string;
  transaction_time_seconds: string;
  token_price_error: string;
  unpriced_tokens_warning: string;
  token_price_source: string;
}

interface I18nNeuron_types {
  seed: string;
  ect: string;
}

interface I18nStaking {
  title: string;
  text: string;
  nervous_systems: string;
  hide_no_neurons_header: string;
  hide_no_neurons_toggle_label: string;
  hide_no_neurons_table_hint: string;
  show_all: string;
}

interface I18nNeurons {
  title: string;
  text: string;
  stake_token: string;
  icp_will_be_locked: string;
  merge_neurons: string;
  merge_neurons_modal_title: string;
  merge_neurons_modal_confirm: string;
  merge_neurons_edit_selection: string;
  merge_neurons_modal_merge_button: string;
  merge_neurons_modal_title_2: string;
  merge_neurons_modal_into: string;
  expected_merge_result: string;
  set_dissolve_delay: string;
  add_user_as_hotkey: string;
  add_user_as_hotkey_message: string;
  add_user_as_hotkey_success: string;
  remove_user_hotkey_confirm_title: string;
  remove_user_hotkey_confirm_text: string;
  remove_hotkey_success: string;
  neuron_create_success: string;
  your_principal: string;
  confirm_dissolve_delay: string;
  follow_neurons_screen: string;
  stake_icp: string;
  may_take_while: string;
  create: string;
  community_fund: string;
  hotkey_control: string;
  missing_rewards: string;
  missing_rewards_soon: string;
  hardware_wallet_control: string;
  amount_icp_stake: string;
  ic_stake: string;
  staked: string;
  inline_remaining: string;
  remaining: string;
  age: string;
  vestion_period: string;
  neuron_id: string;
  neuron_balance: string;
  current_dissolve_delay: string;
  dissolve_delay_title: string;
  no_delay: string;
  dissolve_delay_description: string;
  min_dissolve_delay_description: string;
  dissolve_delay_label: string;
  dissolve_delay_placeholder: string;
  dissolve_delay_below_minimum: string;
  dissolve_delay_below_current: string;
  dissolve_delay_above_maximum: string;
  voting_power: string;
  skip: string;
  update_delay: string;
  set_delay: string;
  confirm_update_delay: string;
  confirm_set_delay: string;
  edit_delay: string;
  cannot_merge_neuron_community: string;
  cannot_merge_neuron_spawning: string;
  cannot_merge_neuron_hotkey: string;
  cannot_merge_neuron_state: string;
  only_merge_two: string;
  need_two_to_merge: string;
  irreversible_action: string;
  claim_seed_neurons_success: string;
  enter_neuron_id_prompt: string;
  add_hotkey_prompt_error: string;
  add_hotkey_prompt_success: string;
  remove_followees_sale_prompt_error: string;
  remove_followees_sale_prompt_success: string;
  top_up_neuron: string;
  top_up_description: string;
  merge_neurons_select_info: string;
  merge_neurons_source_neuron_disappear: string;
  merge_neurons_more_info: string;
  stake_amount: string;
  state: string;
  public_neuron_tooltip: string;
  public_neuron: string;
  private_neuron: string;
  public_neuron_description: string;
  private_neuron_description: string;
  learn_more: string;
  create_as_public: string;
  create_as_public_tooltip: string;
  create_as_public_neuron_failure: string;
}

interface I18nFollow_sns_topics {
  topic_definitions_description: string;
  topic_definitions_title: string;
  topics_title: string;
  legacy_title: string;
  deactivate_catch_all_title: string;
  topics_description: string;
  topics_critical_label: string;
  topics_critical_tooltip: string;
  topics_non_critical_label: string;
  topics_non_critical_tooltip: string;
  topics_following: string;
  topics_legacy_following_description: string;
  legacy_description: string;
  legacy_topics_header: string;
  legacy_followees_header: string;
  catch_all_description: string;
  neuron_title: string;
  neuron_label: string;
  neuron_description: string;
  neuron_follow: string;
  busy_updating: string;
  busy_removing: string;
  busy_removing_catch_all: string;
  busy_removing_legacy: string;
  success_set_following: string;
  success_removing_legacy: string;
  success_removing_catch_all: string;
  error_neuron_not_exist: string;
  error_add_following: string;
  error_remove_following: string;
  error_already_following: string;
}

interface I18nMissing_rewards {
  description: string;
  confirming: string;
  confirm: string;
  badge_label: string;
  hw_create_neuron_warning: string;
  hw_hotkey_warning: string;
}

interface I18nMissing_rewards_banner {
  confirm_title: string;
  days_left_title: string;
  rewards_missing_title: string;
}

interface I18nMissing_rewards_modal {
  goto_neuron: string;
  title: string;
  label: string;
  no_following: string;
}

interface I18nNew_followee {
  title: string;
  placeholder: string;
  label: string;
  follow_neuron: string;
  options_title: string;
  follow: string;
  unfollow: string;
  followee_does_not_exist: string;
  neuron_not_followee: string;
  already_followed: string;
}

interface I18nFollow_neurons {
  description: string;
  current_followees: string;
  add: string;
}

interface I18nFollow_neurons_topic_subtitles {
  Unspecified: string;
  NeuronManagement: string;
  ExchangeRate: string;
  NetworkEconomics: string;
  Governance: string;
  NodeAdmin: string;
  ParticipantManagement: string;
  SubnetManagement: string;
  NetworkCanisterManagement: string;
  Kyc: string;
  NodeProviderRewards: string;
  SnsDecentralizationSale: string;
  IcOsVersionDeployment: string;
  IcOsVersionElection: string;
  SnsAndCommunityFund: string;
  ApiBoundaryNodeManagement: string;
  SubnetRental: string;
  ProtocolCanisterManagement: string;
  ServiceNervousSystemManagement: string;
}

interface I18nVoting {
  topics: string;
  types: string;
  status: string;
  check_all: string;
  uncheck_all: string;
  nothing_found: string;
  all_proposals: string;
  actionable_proposals: string;
  nns_actionable_proposal_tooltip: string;
  sns_actionable_proposal_tooltip: string;
  total_actionable_proposal_tooltip: string;
  is_actionable_status_badge_tooltip: string;
  all_sns_proposals_without_topic: string;
}

interface I18nActionable_proposals_sign_in {
  title: string;
  text: string;
}

interface I18nActionable_proposals_empty {
  title: string;
  text: string;
}

interface I18nCanisters {
  aria_label_canister_card: string;
  text: string;
  create_canister: string;
  link_canister: string;
  add_canister: string;
  create_canister_title: string;
  create_canister_success_id: string;
  create_canister_success_name: string;
  link_canister_success: string;
  enter_canister_id: string;
  canister_id: string;
  enter_name_label: string;
  name: string;
  enter_amount: string;
  review_create_canister: string;
  t_cycles: string;
  minimum_cycles_text_1: string;
  minimum_cycles_text_2: string;
  transaction_fee: string;
  review_cycles_purchase: string;
  change_source: string;
  edit_cycles: string;
  converted_to: string;
}

interface I18nCanister_detail {
  title: string;
  controllers: string;
  t_cycles: string;
  add_cycles: string;
  top_up_canister: string;
  top_up_successful: string;
  unlink: string;
  rename: string;
  confirm_unlink_title: string;
  confirm_unlink_description_1: string;
  confirm_unlink_description_2: string;
  confirm_remove_controller_title: string;
  confirm_remove_controller_description: string;
  confirm_remove_controller_user_description_1: string;
  confirm_remove_controller_user_description_2: string;
  confirm_remove_last_controller_description: string;
  unlink_success: string;
  rename_success: string;
  canister_name_error_too_long: string;
  confirm_new_controller: string;
  enter_controller: string;
  edit_controller: string;
  new_controller: string;
  add_controller: string;
  rename_canister: string;
  rename_canister_title: string;
  rename_canister_placeholder: string;
  status_stopped: string;
  status_stopping: string;
  status_running: string;
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
  refundSwap: string;
  participateSwap: string;
  approve: string;
}

interface I18nWallet {
  title: string;
  direction_from: string;
  direction_to: string;
  no_transactions: string;
  icp_qrcode_aria_label: string;
  icrc_qrcode_aria_label: string;
  token_address: string;
  pending_transaction_timestamp: string;
}

interface I18nBusy_screen {
  pending_approval_hw: string;
  take_long: string;
}

interface I18nProposal_detail {
  headline: string;
  title: string;
  summary: string;
  topic_prefix: string;
  status_prefix: string;
  type_prefix: string;
  reward_prefix: string;
  id_prefix: string;
  proposer_prefix: string;
  proposer_description: string;
  neurons_voted: string;
  neurons_voted_plural: string;
  loading_neurons: string;
  payload: string;
  created_prefix: string;
  created_description: string;
  decided_prefix: string;
  decided_description: string;
  executed_prefix: string;
  executed_description: string;
  failed_prefix: string;
  failed_description: string;
  no_more_info: string;
  voting_results: string;
  remaining: string;
  next: string;
  previous: string;
  sign_in: string;
  toggle_lable: string;
  toggle_tree: string;
  toggle_raw: string;
  json_unit_basis_points: string;
  json_unit_seconds: string;
  json_unit_e8s: string;
  id: string;
}

interface I18nProposal_detail__vote {
  vote_with_neurons: string;
  vote_with_neurons_plural: string;
  voting_power_label: string;
  vote_progress: string;
  adopt: string;
  reject: string;
  confirm_adopt_headline: string;
  confirm_adopt_text: string;
  confirm_reject_headline: string;
  confirm_reject_text: string;
  vote_status: string;
  cast_vote_neuronId: string;
  cast_vote_votingPower: string;
  vote_adopt_in_progress: string;
  vote_reject_in_progress: string;
  vote_status_registering: string;
  vote_status_updating: string;
  expiration: string;
  decision_intro: string;
  standard_majority: string;
  standard_majority_description: string;
  immediate_majority: string;
  immediate_majority_description: string;
  super_majority_decision_intro: string;
  standard_super_majority: string;
  standard_super_majority_description: string;
  immediate_super_majority: string;
  immediate_super_majority_description: string;
  cast_votes: string;
  cast_votes_needs: string;
  no_nns_neurons: string;
  no_sns_neurons: string;
  no_nns_neurons_description: string;
  stake_neuron: string;
}

interface I18nProposal_detail__ineligible {
  headline: string;
  headline_plural: string;
  text: string;
  reason_since: string;
  reason_no_permission: string;
  reason_short: string;
}

interface I18nNeuron_detail {
  title: string;
  voting_history: string;
  vote: string;
  increase_dissolve_delay: string;
  start_dissolving: string;
  stop_dissolving: string;
  disburse: string;
  increase_stake: string;
  split_neuron: string;
  voting_power_subtitle: string;
  voting_power_zero_subtitle: string;
  voting_power_zero: string;
  voting_power_section_description_expanded_zero: string;
  voting_power_section_description_expanded_zero_nns: string;
  calculated_as: string;
  voting_power_section_calculation_generic: string;
  voting_power_section_calculation_generic_new: string;
  this_neuron_calculation: string;
  voting_power_section_calculation_specific: string;
  voting_power_section_calculation_specific_new: string;
  maturity_section_description: string;
  staked_description: string;
  nns_staked_maturity_tooltip: string;
  sns_staked_maturity_tooltip: string;
  age_bonus_label: string;
  dissolve_bonus_label: string;
  no_age_bonus: string;
  no_dissolve_bonus: string;
  available_description: string;
  join_community_fund_description_1: string;
  join_community_fund_description_2: string;
  join_community_fund_hw_alert_1: string;
  join_community_fund_hw_alert_2: string;
  leave_community_fund_description: string;
  participate_community_fund: string;
  auto_stake_maturity: string;
  auto_stake_maturity_on: string;
  auto_stake_maturity_off: string;
  auto_stake_maturity_on_success: string;
  auto_stake_maturity_off_success: string;
  maturity_title: string;
  vote_delegation_title: string;
  vote_delegation_tooltip_all: string;
  vote_delegation_tooltip_some: string;
  vote_delegation_tooltip_none: string;
  maturity_last_distribution: string;
  maturity_last_distribution_info: string;
  stake_maturity: string;
  view_active_disbursements_total: string;
  view_active_disbursements: string;
  view_active_disbursements_status: string;
  view_active_disbursements_modal_title: string;
  view_active_disbursements_to: string;
  disburse_maturity_description_1: string;
  disburse_maturity_description_2_nns: string;
  disburse_maturity_description_2_sns: string;
  disburse_maturity_amount: string;
  disburse_maturity_confirmation_percentage: string;
  disburse_maturity_confirmation_amount: string;
  disburse_maturity_confirmation_tokens: string;
  disburse_maturity_confirmation_destination: string;
  disburse_maturity_edit: string;
  stake: string;
  spawn_neuron: string;
  spawn: string;
  disburse_stake_disabled_tooltip_zero: string;
  stake_maturity_disabled_tooltip: string;
  stake_maturity_disabled_tooltip_max_disbursements: string;
  disburse_maturity_disabled_tooltip_zero: string;
  disburse_maturity_disabled_tooltip_non_zero: string;
  start_dissolve_description: string;
  stop_dissolve_description: string;
  join_community_fund_success: string;
  leave_community_fund_success: string;
  dummy_proposal_success: string;
  unlock_neuron_success: string;
  add_maturity_success: string;
  update_neuron_success: string;
  following_title: string;
  following_description_to_be_removed: string;
  following_description: string;
  following_note: string;
  following_link: string;
  follow_neurons: string;
  no_ballots: string;
  split_neuron_confirm: string;
  merge_neurons_success: string;
  disburse_neuron_title: string;
  split_neuron_success: string;
  split_neuron_disabled_tooltip: string;
  spawn_neuron_disabled_tooltip: string;
  disburse_maturity_disabled_tooltip: string;
  hotkeys_title: string;
  add_hotkey: string;
  no_notkeys: string;
  no_notkeys_yet: string;
  add_hotkey_modal_title: string;
  enter_hotkey: string;
  invalid_hotkey: string;
  disburse_success: string;
  edit_percentage: string;
  stake_maturity_modal_title: string;
  disburse_maturity_modal_title: string;
  disburse_maturity: string;
  disburse_maturity_confirmation_modal_title: string;
  disburse_maturity_confirmation_description: string;
  disburse_maturity_success: string;
  active_maturity_disbursements_description_nns: string;
  active_maturity_disbursements_description_sns: string;
  active_maturity_disbursements_amount: string;
  stake_confirmation_modal_title: string;
  stake_maturity_modal_description: string;
  stake_maturity_confirmation: string;
  stake_maturity_success: string;
  spawn_neuron_modal_title: string;
  spawn_confirmation_modal_title: string;
  spawn_neuron_success: string;
  spawn_neuron_choose: string;
  spawn_neuron_explanation_1: string;
  spawn_neuron_explanation_2: string;
  spawn_neuron_note_hw: string;
  current_stake: string;
  current_maturity: string;
  available_maturity: string;
  nns_available_maturity_tooltip: string;
  sns_available_maturity_tooltip: string;
  maturity_range: string;
  spawning_neuron_info: string;
  dissolve_delay_row_title: string;
  remaining_title: string;
  unspecified: string;
  advanced_settings_title: string;
  neuron_account: string;
  dissolve_date: string;
  amount_maturity: string;
  created: string;
  reward_status_active: string;
  reward_status_missing_soon: string;
  reward_status_missing_soon_description: string;
  reward_status_inactive: string;
  reward_status_inactive_description: string;
  reward_status_inactive_reset_description: string;
  neuron_state_tooltip: string;
  dissolve_delay_tooltip: string;
  neuron_stake_refreshed: string;
  change_neuron_make_neuron_public: string;
  change_neuron_make_neuron_private: string;
  change_neuron_make_neuron_public_confirmation: string;
  change_neuron_make_neuron_private_confirmation: string;
  change_neuron_make_neuron_public_description: string;
  change_neuron_make_neuron_private_description: string;
  make_neuron_private: string;
  make_neuron_public: string;
  change_neuron_public_success: string;
  change_neuron_private_success: string;
  change_neuron_visibility_loading: string;
  next: string;
  previous: string;
  change_neuron_visibility_partial_failure: string;
  change_neuron_visibility_failure: string;
  apply_to_all: string;
  neurons: string;
  uncontrollable_neurons_description: string;
  hardware_wallet: string;
  retrieving_data: string;
  public_visibility_action_hw_tooltip: string;
}

interface I18nSns_launchpad {
  header: string;
  committed_projects: string;
  no_committed_projects: string;
  no_opening_soon_projects: string;
  no_projects: string;
  open_projects: string;
  upcoming_projects: string;
  no_open_projects: string;
  proposals: string;
  project_logo: string;
  no_proposals: string;
}

interface I18nLaunchpad {
  headline: string;
  subheadline: string;
  upcoming_launches: string;
  launched_projects: string;
}

interface I18nSns_project_detail {
  swap_proposal: string;
  link_to_dashboard: string;
  token_name: string;
  token_symbol: string;
  total_tokens: string;
  total_tokens_supply: string;
  min_participant_commitment: string;
  max_participant_commitment: string;
  max_nf_commitment: string;
  min_participants: string;
  current_overall_commitment: string;
  current_nf_commitment: string;
  not_participating: string;
  current_direct_commitment: string;
  current_sale_buyer_count: string;
  min_commitment_goal: string;
  max_commitment_goal: string;
  min_nf_commitment_goal: string;
  max_nf_commitment_goal: string;
  min_participation_reached: string;
  deadline: string;
  starts: string;
  user_commitment: string;
  user_current_commitment: string;
  status: string;
  status_open: string;
  status_adopted: string;
  status_committed: string;
  status_aborted: string;
  status_pending: string;
  status_unspecified: string;
  status_finalizing: string;
  participate_swap_description: string;
  understand_agree: string;
  participate_success: string;
  participate: string;
  increase_participation: string;
  status_completed: string;
  completed: string;
  sale_end: string;
  persons_excluded: string;
  max_user_commitment_reached: string;
  not_eligible_to_participate: string;
  getting_sns_open_ticket: string;
  current_nf_commitment_description: string;
  sign_in: string;
}

interface I18nSns_sale {
  participation_in_progress: string;
  step_initialization: string;
  step_transfer: string;
  step_notify: string;
  step_reload: string;
  connecting_sale_canister: string;
}

interface I18nSns_neuron_detail {
  vesting_period_tooltip: string;
  add_hotkey_info: string;
  add_hotkey_tooltip: string;
}

interface I18nSns_neurons {
  text: string;
  stake_sns_neuron: string;
  sns_neuron_destination: string;
  stake_sns_neuron_success: string;
  min_dissolve_delay_description: string;
}

interface I18nResponsive_table {
  sorting: string;
  descending_order: string;
  ascending_order: string;
}

interface I18nTime {
  year: string;
  year_plural: string;
  month: string;
  month_plural: string;
  day: string;
  day_plural: string;
  hour: string;
  hour_plural: string;
  minute: string;
  minute_plural: string;
  second: string;
  second_plural: string;
}

interface I18nError__ledger {
  unexpected: string;
  app_version_not_supported: string;
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
  access_denied: string;
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
  not_selected: string;
}

interface I18nError__canister {
  already_attached: string;
  name_taken: string;
  name_too_long: string;
  limit_exceeded: string;
  unlink_not_found: string;
  unknown_link: string;
  unknown_unlink: string;
  get_exchange_rate: string;
}

interface I18nError__imported_tokens {
  load_imported_tokens: string;
  add_imported_token: string;
  remove_imported_token: string;
  update_imported_token: string;
  too_many: string;
  ledger_canister_loading: string;
  is_duplication: string;
  is_sns: string;
  is_important: string;
  is_icp: string;
  invalid_canister_id: string;
}

interface I18nError__sns {
  undefined_project: string;
  list_summaries: string;
  load_swap_commitment: string;
  load_sale_total_commitments: string;
  load_sale_lifecycle: string;
  sns_remove_hotkey: string;
  sns_split_neuron: string;
  sns_disburse: string;
  sns_start_dissolving: string;
  sns_stop_dissolving: string;
  sns_stake: string;
  sns_increase_stake: string;
  sns_register_vote: string;
  sns_dissolve_delay_action: string;
  project_not_found: string;
  project_not_open: string;
  not_enough_amount: string;
  commitment_too_large: string;
  commitment_exceeds_current_allowed: string;
  sns_sale_unexpected_error: string;
  sns_sale_unexpected_and_refresh: string;
  sns_sale_final_error: string;
  sns_sale_proceed_with_existing_ticket: string;
  sns_sale_closed: string;
  sns_sale_not_open: string;
  sns_sale_invalid_amount: string;
  sns_sale_invalid_subaccount: string;
  sns_sale_try_later: string;
  sns_sale_committed_not_equal_to_amount: string;
  ledger_temporarily_unavailable: string;
  ledger_duplicate: string;
  ledger_bad_fee: string;
  ledger_created_future: string;
  ledger_too_old: string;
  ledger_insufficient_funds: string;
  sns_add_followee: string;
  sns_remove_followee: string;
  sns_add_hotkey: string;
  sns_stake_maturity: string;
  sns_disburse_maturity: string;
  sns_amount_not_enough_stake_neuron: string;
}

interface I18nAuth_accounts {
  title: string;
  text: string;
}

interface I18nAuth_report {
  title: string;
  text: string;
}

interface I18nAuth_neurons {
  title: string;
}

interface I18nAuth_proposals {}

interface I18nAuth_canisters {
  title: string;
  text: string;
}

interface I18nAuth_sns {}

interface I18nUniverse {
  select_token: string;
  select_nervous_system: string;
  universe_logo: string;
}

interface I18nSns_types {
  sns_specific: string;
}

interface I18nSns_rewards_status {
  0: string;
  1: string;
  2: string;
  3: string;
}

interface I18nSns_rewards_description {
  0: string;
  1: string;
  2: string;
  3: string;
}

interface I18nSns_status {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

interface I18nUniversal_proposal_status {
  unknown: string;
  open: string;
  rejected: string;
  adopted: string;
  executed: string;
  failed: string;
}

interface I18nSns_status_description {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

interface I18nMetrics {
  tvl: string;
  nns_high_load: string;
  thanks_fun: string;
}

interface I18nCkbtc {
  title: string;
  test_title: string;
  logo: string;
  test_logo: string;
  qrcode_aria_label_bitcoin: string;
  qrcode_aria_label_ckBTC: string;
  bitcoin: string;
  test_bitcoin: string;
  btc: string;
  ckbtc_balance_updated: string;
  step_approve_transfer: string;
  step_send_btc: string;
  step_reload: string;
  sending_ckbtc_to_btc: string;
  about_thirty_minutes: string;
  transaction_success_about_thirty_minutes: string;
  loading_address: string;
  receive_btc_title: string;
  ckbtc_buzz_words: string;
  incoming_bitcoin_network: string;
  block_explorer: string;
  bitcoin_address_title: string;
  refresh_balance: string;
  btc_received: string;
  btc_sent: string;
  btc_network: string;
  receiving_btc: string;
  reimbursement: string;
  sending_btc: string;
  sending_btc_failed: string;
  sign_in_for_address: string;
}

interface I18nError__ckbtc {
  already_process: string;
  temporary_unavailable: string;
  info_not_found: string;
  get_btc_address: string;
  get_btc_no_universe: string;
  update_balance: string;
  no_new_confirmed_btc: string;
  retrieve_btc: string;
  malformed_address: string;
  amount_too_low: string;
  insufficient_funds: string;
  retrieve_btc_unknown: string;
  estimated_fee: string;
  retrieve_btc_min_amount: string;
  retrieve_btc_min_amount_unknown: string;
  wait_ckbtc_info_parameters_certified: string;
}

interface I18nFeature_flags_prompt {
  override_true: string;
  override_false: string;
  remove_override: string;
}

interface I18nSettings {
  your_principal: string;
  your_principal_description: string;
  your_session: string;
  your_session_description: string;
}

interface I18nSync {
  status_idle: string;
  status_error: string;
  status_in_progress: string;
  status_idle_detailed: string;
  status_error_detailed: string;
  status_in_progress_detailed: string;
}

interface I18nTokens {
  projects_header: string;
  balance_header: string;
  accounts_header: string;
  settings_button: string;
  hide_zero_balances: string;
  hide_zero_balances_toggle_label: string;
  zero_balance_hidden: string;
  show_all: string;
  add_imported_token_success: string;
  remove_imported_token_success: string;
  update_imported_token_success: string;
  ledger_canister: string;
  index_canister: string;
  ledger_canister_error_tooltip: string;
}

interface I18nImport_token {
  import_token: string;
  imported_token: string;
  verifying: string;
  importing: string;
  removing: string;
  updating: string;
  description: string;
  ledger_label: string;
  index_label_optional: string;
  placeholder: string;
  index_canister_description: string;
  review_token_info: string;
  warning: string;
  remove_confirmation_header: string;
  remove_confirmation_description: string;
  index_label: string;
  index_fallback_label: string;
  import_button: string;
  link_to_dashboard: string;
  add_index_canister: string;
  add_index_description: string;
  failed_tooltip: string;
  maximum_reached_tooltip: string;
  doc_link_label: string;
}

interface I18nPortfolio {
  login_title: string;
  login_description: string;
  no_tokens_card_title: string;
  no_tokens_card_description: string;
  no_tokens_card_button: string;
  no_neurons_card_description: string;
  no_neurons_card_button: string;
  held_tokens_card_title: string;
  held_tokens_card_link: string;
  held_tokens_card_list_first_column: string;
  held_tokens_card_list_second_column: string;
  held_tokens_card_list_third_column: string;
  held_tokens_card_info_row: string;
  staked_tokens_card_title: string;
  staked_tokens_card_link: string;
  staked_tokens_card_list_first_column: string;
  staked_tokens_card_list_second_column_mobile: string;
  staked_tokens_card_list_second_column: string;
  staked_tokens_card_list_third_column: string;
  staked_tokens_card_info_row: string;
  total_assets_title: string;
  project_status_open: string;
  project_status_proposal: string;
  project_status_adopted_proposal: string;
  open_project_card_title: string;
  open_project_current_commitment: string;
  open_project_card_min_icp: string;
  open_project_card_max_icp: string;
  open_project_card_nf: string;
  open_project_card_link: string;
  open_project_card_neuron_fund_tooltip: string;
  adopted_proposal_card_time_remaining: string;
  new_sns_proposal_card_title: string;
  new_sns_proposal_card_link: string;
  new_sns_proposal_card_adopt: string;
  new_sns_proposal_card_reject: string;
  next_card: string;
  previous_card: string;
}

interface I18nHighlight {
  disburse_maturity_title: string;
  disburse_maturity_description: string;
}

interface I18nNeuron_state {
  Unspecified: string;
  Locked: string;
  Spawning: string;
  Dissolved: string;
  Dissolving: string;
}

interface I18nTopics {
  Unspecified: string;
  NeuronManagement: string;
  ExchangeRate: string;
  NetworkEconomics: string;
  Governance: string;
  NodeAdmin: string;
  ParticipantManagement: string;
  SubnetManagement: string;
  NetworkCanisterManagement: string;
  Kyc: string;
  NodeProviderRewards: string;
  SnsDecentralizationSale: string;
  IcOsVersionElection: string;
  IcOsVersionDeployment: string;
  SnsAndCommunityFund: string;
  ApiBoundaryNodeManagement: string;
  SubnetRental: string;
  ProtocolCanisterManagement: string;
  ServiceNervousSystemManagement: string;
}

interface I18nTopics_description {
  Unspecified: string;
  NeuronManagement: string;
  ExchangeRate: string;
  NetworkEconomics: string;
  Governance: string;
  NodeAdmin: string;
  ParticipantManagement: string;
  SubnetManagement: string;
  NetworkCanisterManagement: string;
  Kyc: string;
  NodeProviderRewards: string;
  SnsDecentralizationSale: string;
  IcOsVersionElection: string;
  IcOsVersionDeployment: string;
  SnsAndCommunityFund: string;
  ApiBoundaryNodeManagement: string;
  SubnetRental: string;
  ProtocolCanisterManagement: string;
  ServiceNervousSystemManagement: string;
}

interface I18nRewards {
  Unknown: string;
  AcceptVotes: string;
  ReadyToSettle: string;
  Settled: string;
  Ineligible: string;
}

interface I18nRewards_description {
  Unknown: string;
  AcceptVotes: string;
  ReadyToSettle: string;
  Settled: string;
  Ineligible: string;
}

interface I18nStatus {
  Unknown: string;
  Open: string;
  Rejected: string;
  Accepted: string;
  Executed: string;
  Failed: string;
}

interface I18nStatus_description {
  Unknown: string;
  Open: string;
  Rejected: string;
  Accepted: string;
  Executed: string;
  Failed: string;
}

interface I18nActions {
  RegisterKnownNeuron: string;
  NeuronManagement: string;
  ApproveGenesisKyc: string;
  ManageNetworkEconomics: string;
  RewardNodeProvider: string;
  RewardNodeProviders: string;
  AddOrRemoveNodeProvider: string;
  SetDefaultFollowees: string;
  Motion: string;
  SetSnsTokenSwapOpenTimeWindow: string;
  OpenSnsTokenSwap: string;
  CreateServiceNervousSystem: string;
  InstallCode: string;
  StopOrStartCanister: string;
  UpdateCanisterSettings: string;
}

interface I18nActions_description {
  RegisterKnownNeuron: string;
  NeuronManagement: string;
  ApproveGenesisKyc: string;
  ManageNetworkEconomics: string;
  RewardNodeProvider: string;
  RewardNodeProviders: string;
  AddOrRemoveNodeProvider: string;
  SetDefaultFollowees: string;
  Motion: string;
  SetSnsTokenSwapOpenTimeWindow: string;
  OpenSnsTokenSwap: string;
  CreateServiceNervousSystem: string;
  InstallCode: string;
  StopOrStartCanister: string;
  UpdateCanisterSettings: string;
}

interface I18nNns_functions {
  Unspecified: string;
  CreateSubnet: string;
  AddNodeToSubnet: string;
  NnsCanisterInstall: string;
  NnsCanisterUpgrade: string;
  RecoverSubnet: string;
  UpdateConfigOfSubnet: string;
  AssignNoid: string;
  NnsRootUpgrade: string;
  IcpXdrConversionRate: string;
  DeployGuestosToAllSubnetNodes: string;
  ClearProvisionalWhitelist: string;
  RemoveNodesFromSubnet: string;
  SetAuthorizedSubnetworks: string;
  SetFirewallConfig: string;
  UpdateNodeOperatorConfig: string;
  StopOrStartNnsCanister: string;
  RemoveNodes: string;
  UninstallCode: string;
  UpdateNodeRewardsTable: string;
  AddOrRemoveDataCenters: string;
  UpdateUnassignedNodesConfig: string;
  RemoveNodeOperators: string;
  RerouteCanisterRanges: string;
  AddFirewallRules: string;
  RemoveFirewallRules: string;
  UpdateFirewallRules: string;
  PrepareCanisterMigration: string;
  CompleteCanisterMigration: string;
  AddSnsWasm: string;
  ChangeSubnetMembership: string;
  UpdateSubnetType: string;
  ChangeSubnetTypeAssignment: string;
  UpdateSnsWasmSnsSubnetIds: string;
  UpdateAllowedPrincipals: string;
  InsertSnsWasmUpgradePathEntries: string;
  ReviseElectedGuestosVersions: string;
  BitcoinSetConfig: string;
  UpdateElectedHostosVersions: string;
  UpdateNodesHostosVersion: string;
  AddApiBoundaryNodes: string;
  RemoveApiBoundaryNodes: string;
  UpdateApiBoundaryNodesVersion: string;
  DeployGuestosToSomeApiBoundaryNodes: string;
  DeployGuestosToAllUnassignedNodes: string;
  UpdateSshReadOnlyAccessForAllUnassignedNodes: string;
  ReviseElectedHostosVersions: string;
  DeployHostosToSomeNodes: string;
  SubnetRentalRequest: string;
}

interface I18nNns_functions_description {
  Unspecified: string;
  CreateSubnet: string;
  AddNodeToSubnet: string;
  NnsCanisterInstall: string;
  NnsCanisterUpgrade: string;
  RecoverSubnet: string;
  UpdateConfigOfSubnet: string;
  AssignNoid: string;
  NnsRootUpgrade: string;
  IcpXdrConversionRate: string;
  DeployGuestosToAllSubnetNodes: string;
  ClearProvisionalWhitelist: string;
  RemoveNodesFromSubnet: string;
  SetAuthorizedSubnetworks: string;
  SetFirewallConfig: string;
  UpdateNodeOperatorConfig: string;
  StopOrStartNnsCanister: string;
  RemoveNodes: string;
  UninstallCode: string;
  UpdateNodeRewardsTable: string;
  AddOrRemoveDataCenters: string;
  UpdateUnassignedNodesConfig: string;
  RemoveNodeOperators: string;
  RerouteCanisterRanges: string;
  AddFirewallRules: string;
  RemoveFirewallRules: string;
  UpdateFirewallRules: string;
  PrepareCanisterMigration: string;
  CompleteCanisterMigration: string;
  AddSnsWasm: string;
  ChangeSubnetMembership: string;
  UpdateSubnetType: string;
  ChangeSubnetTypeAssignment: string;
  UpdateSnsWasmSnsSubnetIds: string;
  UpdateAllowedPrincipals: string;
  InsertSnsWasmUpgradePathEntries: string;
  ReviseElectedGuestosVersions: string;
  BitcoinSetConfig: string;
  UpdateElectedHostosVersions: string;
  UpdateNodesHostosVersion: string;
  AddApiBoundaryNodes: string;
  RemoveApiBoundaryNodes: string;
  UpdateApiBoundaryNodesVersion: string;
  DeployGuestosToSomeApiBoundaryNodes: string;
  DeployGuestosToAllUnassignedNodes: string;
  UpdateSshReadOnlyAccessForAllUnassignedNodes: string;
  ReviseElectedHostosVersions: string;
  DeployHostosToSomeNodes: string;
  SubnetRentalRequest: string;
}

interface I18n {
  lang: Languages;
  core: I18nCore;
  error: I18nError;
  warning: I18nWarning;
  navigation: I18nNavigation;
  alfred: I18nAlfred;
  header: I18nHeader;
  reporting: I18nReporting;
  auth: I18nAuth;
  accounts: I18nAccounts;
  neuron_types: I18nNeuron_types;
  staking: I18nStaking;
  neurons: I18nNeurons;
  follow_sns_topics: I18nFollow_sns_topics;
  missing_rewards: I18nMissing_rewards;
  missing_rewards_banner: I18nMissing_rewards_banner;
  missing_rewards_modal: I18nMissing_rewards_modal;
  new_followee: I18nNew_followee;
  follow_neurons: I18nFollow_neurons;
  follow_neurons_topic_subtitles: I18nFollow_neurons_topic_subtitles;
  voting: I18nVoting;
  actionable_proposals_sign_in: I18nActionable_proposals_sign_in;
  actionable_proposals_empty: I18nActionable_proposals_empty;
  canisters: I18nCanisters;
  canister_detail: I18nCanister_detail;
  transaction_names: I18nTransaction_names;
  wallet: I18nWallet;
  busy_screen: I18nBusy_screen;
  proposal_detail: I18nProposal_detail;
  proposal_detail__vote: I18nProposal_detail__vote;
  proposal_detail__ineligible: I18nProposal_detail__ineligible;
  neuron_detail: I18nNeuron_detail;
  sns_launchpad: I18nSns_launchpad;
  launchpad: I18nLaunchpad;
  sns_project_detail: I18nSns_project_detail;
  sns_sale: I18nSns_sale;
  sns_neuron_detail: I18nSns_neuron_detail;
  sns_neurons: I18nSns_neurons;
  responsive_table: I18nResponsive_table;
  time: I18nTime;
  error__ledger: I18nError__ledger;
  error__attach_wallet: I18nError__attach_wallet;
  error__account: I18nError__account;
  error__canister: I18nError__canister;
  error__imported_tokens: I18nError__imported_tokens;
  error__sns: I18nError__sns;
  auth_accounts: I18nAuth_accounts;
  auth_report: I18nAuth_report;
  auth_neurons: I18nAuth_neurons;
  auth_proposals: I18nAuth_proposals;
  auth_canisters: I18nAuth_canisters;
  auth_sns: I18nAuth_sns;
  universe: I18nUniverse;
  sns_types: I18nSns_types;
  sns_rewards_status: I18nSns_rewards_status;
  sns_rewards_description: I18nSns_rewards_description;
  sns_status: I18nSns_status;
  universal_proposal_status: I18nUniversal_proposal_status;
  sns_status_description: I18nSns_status_description;
  metrics: I18nMetrics;
  ckbtc: I18nCkbtc;
  error__ckbtc: I18nError__ckbtc;
  feature_flags_prompt: I18nFeature_flags_prompt;
  settings: I18nSettings;
  sync: I18nSync;
  tokens: I18nTokens;
  import_token: I18nImport_token;
  portfolio: I18nPortfolio;
  highlight: I18nHighlight;
  neuron_state: I18nNeuron_state;
  topics: I18nTopics;
  topics_description: I18nTopics_description;
  rewards: I18nRewards;
  rewards_description: I18nRewards_description;
  status: I18nStatus;
  status_description: I18nStatus_description;
  actions: I18nActions;
  actions_description: I18nActions_description;
  nns_functions: I18nNns_functions;
  nns_functions_description: I18nNns_functions_description;
}
