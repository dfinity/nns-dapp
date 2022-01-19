export type VotingFilters = Topics | Rewards | Proposals;

export interface VotingFilterModalProps {
  title: string;
  filters: VotingFilters;
}

export enum Topics {
  ExchangeRate = "Exchange Rate",
  NetworkEconomics = "Network Economics",
  Governance = "Governance",
  NodeAdmin = "Node Admin",
  ParticipantManagement = "Participant Management",
  SubnetManagement = "Subnet Management",
  NetworkCanisterManagement = "Network Canister Management",
  Kyc = "Kyc",
  NodeProviderRewards = "Node Provider Rewards",
}

export enum Rewards {
  AcceptVotes = "Accepting Votes",
  ReadyToSettle = "Processing Votes",
  Settled = "Rewards Disbursed",
  Ineligible = "Ineligible",
}

export enum Proposals {
  Open = "Open",
  Rejected = "Rejected",
  Accepted = "Adopted",
  Executed = "Executed",
  Failed = "Failed",
}
