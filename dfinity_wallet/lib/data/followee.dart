
import 'package:dfinity_wallet/data/topic.dart';
import 'package:hive/hive.dart';

part 'followee.g.dart';

@HiveType(typeId: 12)
class Followee {

  @HiveField(0)
  late Topic topic;

  @HiveField(1)
  late List<String> followees;
}
