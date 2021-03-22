import 'package:hive/hive.dart';

part 'proposal.g.dart';

@HiveType(typeId: 5)
class Proposal extends HiveObject {
  @HiveField(0)
  late String name;
  @HiveField(1)
  late String address;
  @HiveField(2)
  late double closeDate;

}