import 'dart:ui';

import 'package:dfinity_wallet/data/data.dart';
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
      this.proposalTimestampSeconds);

  @HiveField(9)
  String? executedTimestampSeconds;
  @HiveField(10)
  String? failedTimestampSeconds;
  @HiveField(11)
  String? decidedTimestampSeconds;
  @HiveField(12)
  String? proposalTimestampSeconds;

  Proposal.empty();

  ProposalType get proposalType {
    if (action.containsKey('ExternalUpdate'))
      return ProposalType.ExternalUpdate;
    if (action.containsKey('ManageNeuron')) return ProposalType.ManageNeuron;
    if (action.containsKey('ApproveKyc')) return ProposalType.ApproveKyc;
    if (action.containsKey('NetworkEconomics'))
      return ProposalType.NetworkEconomics;
    if (action.containsKey('RewardNodeProvider'))
      return ProposalType.RewardNodeProvider;
    if (action.containsKey('AddOrRemoveNodeProvider'))
      return ProposalType.AddOrRemoveNodeProvider;
    if (action.containsKey('Motion')) return ProposalType.Motion;
    return ProposalType.Unspecified;
  }

  DateTime get proposalTimestamp => DateTime.fromMillisecondsSinceEpoch(int.parse(proposalTimestampSeconds!) * 1000);

  String? get motionText => action['Motion']['motionText'];

  ProposalStatus get status {
    if (executedTimestampSeconds != "0") return ProposalStatus.Executed;
    if (failedTimestampSeconds != "0") return ProposalStatus.Failed;
    return ProposalStatus.Open;
  }

  @override
  String get identifier => id.toString();
}

enum ProposalStatus {
  Open, Executed, Failed
}

extension ProposalStatusDisplay on ProposalStatus {
  static final colorMap = {
    ProposalStatus.Executed: Color(0xff0FA958),
    ProposalStatus.Failed: Color(0xffD9D9DA),
    ProposalStatus.Open: Color(0xffFBB03B)
  };
  Color get color => colorMap[this]!;
  static final nameMap = {
    ProposalStatus.Executed: "Executed",
    ProposalStatus.Failed: "Failed",
    ProposalStatus.Open: "Open"
  };
  String get description => nameMap[this]!;
}

enum ProposalType {
  ExternalUpdate,
  ManageNeuron,
  ApproveKyc,
  NetworkEconomics,
  RewardNodeProvider,
  AddOrRemoveNodeProvider,
  Motion,
  Unspecified,
}

extension ProposalTypeDescription on ProposalType {
  static final map = {
    ProposalType.ExternalUpdate: "External Update",
    ProposalType.ManageNeuron: "Manage Neuron",
    ProposalType.ApproveKyc: "Approve Kyc",
    ProposalType.NetworkEconomics: "Network Economics",
    ProposalType.RewardNodeProvider: "Reward Node Provider",
    ProposalType.AddOrRemoveNodeProvider: "Add Or Remove Node Provider",
    ProposalType.Motion: "Motion",
    ProposalType.Unspecified: "Unspecified",
  };
  String get description => map[this] ?? "";
}
