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
  @HiveField(9)
  late String proposer;
  @HiveField(6)
  late String status;
  @HiveField(7)
  late int no;
  @HiveField(8)
  late int yes;

  Proposal(this.id, this.text, this.url, this.proposer, this.status, this.no,
      this.yes);

  Proposal.empty();

  @override
  String get identifier => id;
}

