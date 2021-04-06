import 'package:hive/hive.dart';

part 'vote.g.dart';

@HiveType(typeId: 10)
enum Vote {
  @HiveField(0)
  UNSPECIFIED,
  @HiveField(1)
  YES,
  @HiveField(2)
  NO
}
