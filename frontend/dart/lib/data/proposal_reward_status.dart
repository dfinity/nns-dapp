enum ProposalRewardStatus {
Unknown,

// The proposal still accept votes, for the purpose of
// vote rewards. This implies nothing on the ProposalStatus.
AcceptVotes,

// The proposal no longer accepts votes. It is due to settle
// at the next reward event.
ReadyToSettle,

// The proposal has been taken into account in a reward event.
Settled,

// The proposal is not eligible to be taken into account in a reward event.
Ineligible}

extension RewardStatusDesc on ProposalRewardStatus{
  static const map = {
  ProposalRewardStatus.Unknown: "Unknown",
  ProposalRewardStatus.AcceptVotes: "Accepting Votes",
  ProposalRewardStatus.ReadyToSettle: "Processing Votes",
  ProposalRewardStatus.Settled: "Rewards Disbursed",
  ProposalRewardStatus.Ineligible: "Ineligible"
  };
  String get label => map[this]!;
}
