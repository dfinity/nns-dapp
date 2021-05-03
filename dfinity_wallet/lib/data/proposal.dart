import 'dart:ui';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/proposal_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:hive/hive.dart';

part 'proposal.g.dart';

@HiveType(typeId: 105)
class Proposal extends DfinityEntity {
  @HiveField(1)
  late String id;
  @HiveField(2)
  late String summary;
  @HiveField(3)
  late String url;
  @HiveField(4)
  late String proposer;
  @HiveField(6)
  late int no;
  @HiveField(7)
  late int yes;
  @HiveField(8)
  late Map<String, dynamic> action;
  @HiveField(9)
  String? executedTimestampSeconds;
  @HiveField(10)
  String? failedTimestampSeconds;
  @HiveField(11)
  String? decidedTimestampSeconds;
  @HiveField(12)
  String? proposalTimestampSeconds;
  @HiveField(13)
  DateTime? cacheUpdateDate;
  @HiveField(14)
  late Topic topic;
  @HiveField(15)
  late ProposalStatus status;
  @HiveField(16)
  late ProposalRewardStatus rewardStatus;

  Proposal(
    this.id,
    this.summary,
    this.url,
    this.proposer,
    this.no,
    this.yes,
    this.executedTimestampSeconds,
    this.failedTimestampSeconds,
    this.decidedTimestampSeconds,
    this.proposalTimestampSeconds,
    this.cacheUpdateDate,
    this.topic,
    this.status,
    this.rewardStatus,
  );

  Proposal.empty();

  ProposalType get proposalType {
    if (action.containsKey('ExecuteNnsFunction'))
      return ProposalType.ExecuteNnsFunction;
    if (action.containsKey('ManageNeuron')) return ProposalType.ManageNeuron;
    if (action.containsKey('ApproveGenesisKyc')) return ProposalType.ApproveGenesisKyc;
    if (action.containsKey('ManageNetworkEconomics'))
      return ProposalType.ManageNetworkEconomics;
    if (action.containsKey('RewardNodeProvider'))
      return ProposalType.RewardNodeProvider;
    if (action.containsKey('AddOrRemoveNodeProvider'))
      return ProposalType.AddOrRemoveNodeProvider;
    if (action.containsKey('Motion')) return ProposalType.Motion;
    return ProposalType.Unspecified;
  }

  DateTime get proposalTimestamp => DateTime.fromMillisecondsSinceEpoch(
      int.parse(proposalTimestampSeconds!) * 1000);

  String? get motionText => action['Motion']['motionText'];

  @override
  String get identifier => id.toString();
}


extension ProposalStatusDisplay on ProposalStatus {
  static final colorMap = {
    ProposalStatus.Unknown: Color(0xffD9D9DA),
    ProposalStatus.Open: Color(0xffFBB03B),
    ProposalStatus.Rejected: Color(0xffD9D9DA),
    ProposalStatus.Accepted: Color(0xffD9D9DA),
    ProposalStatus.Executed: Color(0xff0FA958),
    ProposalStatus.Failed: Color(0xffD9D9DA),
  };

  Color get color => colorMap[this]!;
  static final nameMap = {
    ProposalStatus.Unknown: "Unknown",
    ProposalStatus.Open: "Open",
    ProposalStatus.Rejected: "Rejected",
    ProposalStatus.Accepted: "Adopted",
    ProposalStatus.Executed: "Executed",
    ProposalStatus.Failed: "Failed",
  };

  String get description => nameMap[this]!;
}

enum ProposalType {
  ExecuteNnsFunction,
  ManageNeuron,
  ApproveGenesisKyc,
  ManageNetworkEconomics,
  RewardNodeProvider,
  AddOrRemoveNodeProvider,
  Motion,
  Unspecified,
}

extension ProposalTypeDescription on ProposalType {
  static final map = {
    ProposalType.ExecuteNnsFunction: "Execute NNS Function",
    ProposalType.ManageNeuron: "Manage Neuron",
    ProposalType.ApproveGenesisKyc: "Approve Genesis Kyc",
    ProposalType.ManageNetworkEconomics: "Manage Network Economics",
    ProposalType.RewardNodeProvider: "Reward Node Provider",
    ProposalType.AddOrRemoveNodeProvider: "Add Or Remove Node Provider",
    ProposalType.Motion: "Motion",
    ProposalType.Unspecified: "Unspecified",
  };

  String get description => map[this] ?? "";
}
