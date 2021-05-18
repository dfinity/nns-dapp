import 'dart:ui';
import 'dart:core';

import 'package:dfinity_wallet/data/data.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/proposal_status.dart';
import 'package:dfinity_wallet/data/topic.dart';


class Proposal extends DfinityEntity {
  late String id;
  late String summary;
  late String url;
  late String proposer;
  late int no;
  late int yes;
  late Map<String, dynamic> action;
  String? executedTimestampSeconds;
  String? failedTimestampSeconds;
  String? decidedTimestampSeconds;
  String? proposalTimestampSeconds;
  DateTime? cacheUpdateDate;
  late Topic topic;
  late ProposalStatus status;
  late ProposalRewardStatus rewardStatus;
  late String raw;
  late Map<String, Ballot> ballots;

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
      this.raw,
      this.ballots);

  Proposal.empty();

  ProposalType get proposalType {
    if (action.containsKey('ExecuteNnsFunction'))
      return ProposalType.ExecuteNnsFunction;
    if (action.containsKey('ManageNeuron')) 
      return ProposalType.ManageNeuron;
    if (action.containsKey('ApproveGenesisKyc'))
      return ProposalType.ApproveGenesisKyc;
    if (action.containsKey('ManageNetworkEconomics'))
      return ProposalType.ManageNetworkEconomics;
    if (action.containsKey('RewardNodeProvider'))
      return ProposalType.RewardNodeProvider;
    if (action.containsKey('AddOrRemoveNodeProvider'))
      return ProposalType.AddOrRemoveNodeProvider;
    if (action.containsKey('Motion')) 
      return ProposalType.Motion;
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
