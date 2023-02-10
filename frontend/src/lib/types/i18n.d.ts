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
  min: string;
  principal: string;
  toggle: string;
  log: string;
  principal_id: string;
  copy: string;
  ic: string;
  previous: string;
  next: string;
  principal_is: string;
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
  amount_not_enough_top_up_neuron: string;
  stake_neuron: string;
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
  neuron_account_not_found: string;
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
  sns_loading_commited_projects: string;
  swap_not_loaded: string;
  transaction_fee_not_found: string;
  token_not_found: string;
  fetch_transactions: string;
  transaction_data: string;
  amount_not_enough_stake_sns_neuron: string;
  adding_permissions: string;
  canister_invalid_transaction: string;
  ckbtc_get_btc_address: string;
  ckbtc_get_btc_no_account: string;
}

interface I18nWarning {
  auth_sign_out: string;
}

interface I18nNavigation {
  tokens: string;
  canisters: string;
  neurons: string;
  voting: string;
  launchpad: string;
}

interface I18nHeader {
  menu: string;
  title: string;
  logout: string;
  account_menu: string;
}

interface I18nAuth {
  login: string;
  title: string;
  on_chain: string;
  wallet: string;
  stake: string;
  earn: string;
  launchpad: string;
  ic_logo: string;
  dashboard: string;
  voting_rewards: string;
  logo: string;
  github_link: string;
  background: string;
  internetcomputer_dot_org_link: string;
}

interface I18nAccounts {
  main: string;
  balance: string;
  new_transaction: string;
  icp_transaction_description: string;
  sns_transaction_description: string;
  review_action: string;
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
  edit_name: string;
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
  new_transaction_fee: string;
  review_transaction: string;
  edit_destination: string;
  current_balance: string;
  confirm_and_send: string;
  edit_amount: string;
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
  current_balance_total: string;
  description: string;
  edit_transaction: string;
  execute: string;
  select: string;
  manual: string;
  no_account_select: string;
  current_balance_detail: string;
}

interface I18nNeurons {
  title: string;
  text: string;
  stake_neurons: string;
  merge_neurons: string;
  merge_neurons_modal_title: string;
  merge_neurons_modal_confirm: string;
  merge_neurons_edit_selection: string;
  merge_neurons_modal_merge_button: string;
  merge_neurons_modal_title_2: string;
  merge_neurons_modal_with: string;
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
  stake_neuron: string;
  source: string;
  transaction_fee: string;
  current_balance: string;
  may_take_while: string;
  create: string;
  change_source: string;
  community_fund: string;
  hotkey_control: string;
  stake: string;
  amount_icp_stake: string;
  ic_stake: string;
  staked: string;
  inline_remaining: string;
  remaining: string;
  age: string;
  aria_label_neuron_card: string;
  neuron_id: string;
  neuron_balance: string;
  current_dissolve_delay: string;
  dissolve_delay_title: string;
  no_delay: string;
  dissolve_delay_description: string;
  dissolve_delay_label: string;
  dissolve_delay_below_minimum: string;
  dissolve_delay_above_maximum: string;
  voting_power: string;
  skip: string;
  update_delay: string;
  set_delay: string;
  confirm_update_delay: string;
  confirm_set_delay: string;
  edit_delay: string;
  merge_neurons_article_title: string;
  cannot_merge_neuron_community: string;
  cannot_merge_neuron_spawning: string;
  cannot_merge_neuron_hotkey: string;
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
  community_fund_title: string;
  stake_amount: string;
}

interface I18nNew_followee {
  title: string;
  placeholder: string;
  label: string;
  follow_neuron: string;
  options_title: string;
  follow: string;
  unfollow: string;
  same_neuron: string;
  followee_does_not_exist: string;
  neuron_not_followee: string;
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
  topic_11_title: string;
  topic_11_subtitle: string;
  topic_12_title: string;
  topic_12_subtitle: string;
  topic_13_title: string;
  topic_13_subtitle: string;
  topic_14_title: string;
  topic_14_subtitle: string;
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
  aria_label_canister_card: string;
  text: string;
  create_canister: string;
  link_canister: string;
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
  change_source: string;
  edit_cycles: string;
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
  edit_controller: string;
  new_controller: string;
  add_controller: string;
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
  participateSwap: string;
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
  status_prefix: string;
  type_prefix: string;
  reward_prefix: string;
  id_prefix: string;
  proposer_prefix: string;
  proposer_description: string;
  open_voting_prefix: string;
  adopt: string;
  reject: string;
  my_votes: string;
  loading_neurons: string;
  unknown_nns_function: string;
  nns_function_name: string;
  payload: string;
  summary_toggle_view: string;
  vote: string;
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
  older: string;
  newer: string;
  older_short: string;
  newer_short: string;
  sign_in: string;
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
  cast_vote_neuronId: string;
  cast_vote_votingPower: string;
  vote_adopt_in_progress: string;
  vote_reject_in_progress: string;
  vote_status_registering: string;
  vote_status_updating: string;
}

interface I18nProposal_detail__ineligible {
  headline: string;
  text: string;
  reason_since: string;
  reason_short: string;
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
  voting_power_tooltip_with_stake: string;
  join_community_fund_description: string;
  leave_community_fund_description: string;
  participate_community_fund: string;
  auto_stake_maturity: string;
  auto_stake_maturity_on: string;
  auto_stake_maturity_off: string;
  auto_stake_maturity_on_success: string;
  auto_stake_maturity_off_success: string;
  community_fund_more_info: string;
  maturity_title: string;
  stake_maturity: string;
  stake: string;
  spawn_neuron: string;
  spawn: string;
  stake_maturity_disabled_tooltip: string;
  stake_maturity_tooltip: string;
  start_dissolve_description: string;
  stop_dissolve_description: string;
  join_community_fund_success: string;
  leave_community_fund_success: string;
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
  spawn_neuron_disabled_tooltip: string;
  hotkeys_title: string;
  add_hotkey: string;
  no_notkeys: string;
  add_hotkey_modal_title: string;
  enter_hotkey: string;
  remove_hotkey_success: string;
  invalid_hotkey: string;
  disburse_success: string;
  edit_percentage: string;
  stake_maturity_modal_title: string;
  stake_confirmation_modal_title: string;
  stake_maturity_modal_description: string;
  stake_maturity_confirmation: string;
  stake_maturity_success: string;
  spawn_neuron_modal_title: string;
  spawn_confirmation_modal_title: string;
  spawn_neuron_modal_description: string;
  spawn_neuron_success: string;
  spawn_neuron_confirmation_q: string;
  spawn_neuron_confirmation_a: string;
  spawn_neuron_choose: string;
  spawn_neuron_explanation_1: string;
  spawn_neuron_explanation_2: string;
  spawn_neuron_note_hw: string;
  current_stake: string;
  current_maturity: string;
  available_maturity: string;
  dissolve_delay_range: string;
  maturity_range: string;
  spawning_neuron_info: string;
  maturity_percentage: string;
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

interface I18nSns_project {
  project: string;
}

interface I18nSns_project_detail {
  token_name: string;
  token_symbol: string;
  total_tokens: string;
  min_commitment: string;
  max_commitment: string;
  current_overall_commitment: string;
  min_commitment_goal: string;
  max_commitment_goal: string;
  deadline: string;
  starts: string;
  user_commitment: string;
  user_current_commitment: string;
  status: string;
  status_open: string;
  status_adopted: string;
  enter_amount: string;
  status_committed: string;
  status_aborted: string;
  status_pending: string;
  status_unspecified: string;
  participate_swap_description: string;
  participate_swap_warning: string;
  understand_agree: string;
  participate_success: string;
  participate: string;
  increase_participation: string;
  status_completed: string;
  completed: string;
  sale_end: string;
  max_left: string;
  max_user_commitment_reached: string;
  sign_in: string;
}

interface I18nSns_neuron_detail {
  header: string;
  all_topics: string;
  community_fund_section: string;
  add_hotkey_info: string;
  add_hotkey_tooltip: string;
}

interface I18nSns_neurons {
  text: string;
  stake_sns_neuron: string;
  sns_neuron_destination: string;
  stake_sns_neuron_success: string;
  token_stake: string;
  dissolve_delay_description: string;
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

interface I18nError__sns {
  init: string;
  undefined_project: string;
  list_summaries: string;
  load_summary: string;
  list_swap_commitments: string;
  load_swap_commitment: string;
  load_parameters: string;
  sns_remove_hotkey: string;
  sns_split_neuron: string;
  sns_disburse: string;
  sns_start_dissolving: string;
  sns_stop_dissolving: string;
  sns_stake: string;
  sns_increase_stake: string;
  sns_neuron_account: string;
  sns_dissolve_delay_action: string;
  project_not_found: string;
  project_not_open: string;
  not_enough_amount: string;
  commitment_too_large: string;
  commitment_exceeds_current_allowed: string;
  cannot_participate: string;
  invalid_root_canister_id: string;
  ledger_temporarily_unavailable: string;
  ledger_duplicate: string;
  ledger_bad_fee: string;
  ledger_created_future: string;
  ledger_too_old: string;
  ledger_unsufficient_funds: string;
  sns_add_followee: string;
  sns_remove_followee: string;
  sns_load_functions: string;
  sns_add_hotkey: string;
  sns_stake_maturity: string;
  sns_amount_not_enough_stake_neuron: string;
}

interface I18nAuth_accounts {
  title: string;
  text: string;
}

interface I18nAuth_neurons {
  title: string;
  text: string;
}

interface I18nAuth_proposals {
  title: string;
  text: string;
  sign_in: string;
}

interface I18nAuth_canisters {
  title: string;
  text: string;
}

interface I18nAuth_sns {
  title: string;
  text: string;
}

interface I18nUniverse {
  select_token: string;
  select: string;
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
}

interface I18nCkbtc {
  title: string;
  ckBTC: string;
  logo: string;
  receive: string;
  address: string;
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
  SnsDecentralizationSale: string;
  ReplicaVersionManagement: string;
  SubnetReplicaVersionManagement: string;
  SnsAndCommunityFund: string;
}

interface I18nTopics_description {
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
  SnsDecentralizationSale: string;
  ReplicaVersionManagement: string;
  SubnetReplicaVersionManagement: string;
  SnsAndCommunityFund: string;
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
  ManageNeuron: string;
  ApproveGenesisKyc: string;
  ManageNetworkEconomics: string;
  RewardNodeProvider: string;
  RewardNodeProviders: string;
  AddOrRemoveNodeProvider: string;
  SetDefaultFollowees: string;
  Motion: string;
  SetSnsTokenSwapOpenTimeWindow: string;
  OpenSnsTokenSwap: string;
}

interface I18nActions_description {
  RegisterKnownNeuron: string;
  ManageNeuron: string;
  ApproveGenesisKyc: string;
  ManageNetworkEconomics: string;
  RewardNodeProvider: string;
  RewardNodeProviders: string;
  AddOrRemoveNodeProvider: string;
  SetDefaultFollowees: string;
  Motion: string;
  SetSnsTokenSwapOpenTimeWindow: string;
  OpenSnsTokenSwap: string;
}

interface I18nNns_functions {
  Unspecified: string;
  CreateSubnet: string;
  AddNodeToSubnet: string;
  NnsCanisterInstall: string;
  NnsCanisterUpgrade: string;
  BlessReplicaVersion: string;
  RecoverSubnet: string;
  UpdateConfigOfSubnet: string;
  AssignNoid: string;
  NnsRootUpgrade: string;
  IcpXdrConversionRate: string;
  UpdateSubnetReplicaVersion: string;
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
  RetireReplicaVersion: string;
  InsertSnsWasmUpgradePathEntries: string;
}

interface I18nNns_functions_description {
  Unspecified: string;
  CreateSubnet: string;
  AddNodeToSubnet: string;
  NnsCanisterInstall: string;
  NnsCanisterUpgrade: string;
  BlessReplicaVersion: string;
  RecoverSubnet: string;
  UpdateConfigOfSubnet: string;
  AssignNoid: string;
  NnsRootUpgrade: string;
  IcpXdrConversionRate: string;
  UpdateSubnetReplicaVersion: string;
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
  RetireReplicaVersion: string;
  InsertSnsWasmUpgradePathEntries: string;
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
  transaction_names: I18nTransaction_names;
  wallet: I18nWallet;
  busy_screen: I18nBusy_screen;
  proposal_detail: I18nProposal_detail;
  proposal_detail__vote: I18nProposal_detail__vote;
  proposal_detail__ineligible: I18nProposal_detail__ineligible;
  neuron_detail: I18nNeuron_detail;
  sns_launchpad: I18nSns_launchpad;
  sns_project: I18nSns_project;
  sns_project_detail: I18nSns_project_detail;
  sns_neuron_detail: I18nSns_neuron_detail;
  sns_neurons: I18nSns_neurons;
  time: I18nTime;
  error__ledger: I18nError__ledger;
  error__attach_wallet: I18nError__attach_wallet;
  error__account: I18nError__account;
  error__canister: I18nError__canister;
  theme: I18nTheme;
  error__sns: I18nError__sns;
  auth_accounts: I18nAuth_accounts;
  auth_neurons: I18nAuth_neurons;
  auth_proposals: I18nAuth_proposals;
  auth_canisters: I18nAuth_canisters;
  auth_sns: I18nAuth_sns;
  universe: I18nUniverse;
  sns_rewards_status: I18nSns_rewards_status;
  sns_rewards_description: I18nSns_rewards_description;
  sns_status: I18nSns_status;
  sns_status_description: I18nSns_status_description;
  metrics: I18nMetrics;
  ckbtc: I18nCkbtc;
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
