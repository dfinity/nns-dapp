import 'package:hive/hive.dart';

part 'topic.g.dart';

@HiveType(typeId: 11)
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
