

import 'package:hive/hive.dart';

part 'proposal_status.g.dart';

@HiveType(typeId: 113)
enum ProposalStatus {
@HiveField(0)
Unknown,
@HiveField(1)
Open,
@HiveField(2)
Rejected,
@HiveField(3)
Accepted,
@HiveField(4)
Executed,
@HiveField(5)
Failed
}
