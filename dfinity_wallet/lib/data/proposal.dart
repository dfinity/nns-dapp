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

  String? get motionText => action['Motion']['motionText'];

  String get status {
    if(executedTimestampSeconds != "0") return "Executed";
    if(failedTimestampSeconds != "0") return "Failed";
    return "Open";
  }

  @override
  String get identifier => id.toString();
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

