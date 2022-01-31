/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
  close: string;
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
}

interface I18nNeurons {
  title: string;
  text: string;
  principal_is: string;
}

interface I18nVoting {
  title: string;
  text: string;
  topics: string;
  rewards: string;
  proposals: string;
  hide_unavailable_proposals: string;
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

interface I18n {
  lang: Languages;
  core: I18nCore;
  navigation: I18nNavigation;
  header: I18nHeader;
  auth: I18nAuth;
  accounts: I18nAccounts;
  neurons: I18nNeurons;
  voting: I18nVoting;
  topics: I18nTopics;
  rewards: I18nRewards;
  proposals: I18nProposals;
}
