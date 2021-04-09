import 'package:dfinity_wallet/data/vote.dart';
import 'package:hive/hive.dart';

part 'ballot_info.g.dart';

@HiveType(typeId: 107)
class BallotInfo  {
  @HiveField(0)
  late Vote vote;

  @HiveField(1)
  late String proposalId;
}

