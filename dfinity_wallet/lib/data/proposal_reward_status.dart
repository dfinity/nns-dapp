import 'package:hive/hive.dart';

part 'proposal_reward_status.g.dart';

@HiveType(typeId: 112)
enum ProposalRewardStatus {
@HiveField(0)
Unknown,

// The proposal still accept votes, for the purpose of
// vote rewards. This implies nothing on the ProposalStatus.
@HiveField(1)
AcceptVotes,

// The proposal no longer accepts votes. It is due to settle
// at the next reward event.
@HiveField(2)
ReadyToSettle,

// The proposal has been taken into account in a reward event.
@HiveField(3)
Settled,

// The proposal is not eligible to be taken into account in a reward event.
@HiveField(4)
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
