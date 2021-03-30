import 'package:dfinity_wallet/data/data.dart';
import 'package:hive/hive.dart';

part 'proposal.g.dart';

@HiveType(typeId: 5)
class Proposal extends DfinityEntity {

  @HiveField(3)
  late String id;
  @HiveField(4)
  late String text;
  @HiveField(5)
  late String url;

  Proposal(this.id, this.text, this.url);

  @override
  String get identifier => id;
}