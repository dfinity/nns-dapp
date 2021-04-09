import 'package:dfinity_wallet/data/data.dart';
import 'package:hive/hive.dart';

part 'proposal.g.dart';

@HiveType(typeId: 105)
class Proposal extends DfinityEntity {
  @HiveField(1)
  late String id;
  @HiveField(2)
  late String text;
  @HiveField(3)
  late String url;
  @HiveField(4)
  late String proposer;
  @HiveField(5)
  late String status;
  @HiveField(6)
  late int no;
  @HiveField(7)
  late int yes;

  Proposal(this.id, this.text, this.url, this.proposer, this.status, this.no,
      this.yes);

  Proposal.empty();

  @override
  String get identifier => id.toString();
}

