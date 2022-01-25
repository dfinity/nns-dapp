export type VotingFilters = typeof Topics | typeof Rewards | typeof Proposals;

export interface VotingFilterModalProps {
  labelKey: "topics" | "rewards" | "proposals";
  filters: VotingFilters;
}

export enum Topics {
  ExchangeRate = "exchange_rate",
  NetworkEconomics = "network_economics",
  Governance = "governance",
  NodeAdmin = "node_admin",
  ParticipantManagement = "participant_management",
  SubnetManagement = "subnet_management",
  NetworkCanisterManagement = "network_canister_management",
  Kyc = "kyc",
  NodeProviderRewards = "node_provider_rewards",
}

export enum Rewards {
  AcceptVotes = "accept_votes",
  ReadyToSettle = "ready_to_settle",
  Settled = "settled",
  Ineligible = "ineligible",
}

export enum Proposals {
  Open = "open",
  Rejected = "rejected",
  Accepted = "accepted",
  Executed = "executed",
  Failed = "failed",
}
