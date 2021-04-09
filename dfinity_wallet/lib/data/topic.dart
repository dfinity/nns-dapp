import 'package:hive/hive.dart';

part 'topic.g.dart';

@HiveType(typeId: 109)
enum Topic {
  @HiveField(0)
  Unspecified,
  @HiveField(1)
  ManageNeuron,
  @HiveField(2)
  ExchangeRate,
  @HiveField(3)
  NetworkEconomics,
  @HiveField(4)
  Governance,
  @HiveField(5)
  NodeAdmin,
  @HiveField(6)
  ParticipantManagement,
  @HiveField(7)
  SubnetManagement,
  @HiveField(8)
  NetworkCanisterManagement,
  @HiveField(9)
  Kyc,
}

const _topicNameMap = {
  Topic.Unspecified: "Unspecified",
  Topic.ManageNeuron: "Manage Neuron",
  Topic.ExchangeRate: "Exchange Rate",
  Topic.NetworkEconomics: "Network Economics",
  Topic.Governance: "Governance",
  Topic.NodeAdmin: "Node Admin",
  Topic.ParticipantManagement: "Participant Management",
  Topic.SubnetManagement: "Subnet Management",
  Topic.NetworkCanisterManagement: "Network Canister Management",
  Topic.Kyc: "Kyc",
};

extension Description on Topic {
  String get description => _topicNameMap[this]!;
}