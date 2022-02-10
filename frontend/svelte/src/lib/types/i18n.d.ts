/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
  icp: string;
}

interface I18nError {
  auth_sync: string;
  sign_in: string;
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
}

interface I18nNeurons {
  title: string;
  text: string;
  principal_is: string;
  stake_neurons: string;
}

interface I18nVoting {
  title: string;
  text: string;
  topics: string;
  rewards: string;
  proposals: string;
  hide_unavailable_proposals: string;
}

interface I18nCanisters {
  title: string;
  create_or_link: string;
}

interface I18nTopics {
  exchange_rate: string;
  network_economics: string;
  governance: string;
  node_admin: string;
  participant_management: string;
  subnet_management: string;
  network_canister_management: string;
  kyc: string;
  node_provider_rewards: string;
}

interface I18nRewards {
  accept_votes: string;
  ready_to_settle: string;
  settled: string;
  ineligible: string;
}

interface I18nProposals {
  open: string;
  rejected: string;
  accepted: string;
  executed: string;
  failed: string;
}

interface I18nWallet {
  title: string;
}

interface I18nProposal_details {
  title: string;
}

interface I18nModals {
  back: string;
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
  proposals: I18nProposals;
  wallet: I18nWallet;
  proposal_details: I18nProposal_details;
  modals: I18nModals;
}
