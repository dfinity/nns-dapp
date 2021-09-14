import 'package:hive/hive.dart';
import 'icp.dart';
import 'transaction_type.dart';

class Transaction extends HiveObject {
  final String from;
  final String to;
  final ICP amount;
  final DateTime date;
  final ICP fee;
  final TransactionType type;
  final BigInt memo;
  final bool incomplete;
  final BigInt blockHeight;

  Transaction(
      {required this.from,
      required this.to,
      required this.amount,
      required this.date,
      required this.fee,
      required this.type,
      required this.memo,
      required this.incomplete,
      required this.blockHeight});
}
