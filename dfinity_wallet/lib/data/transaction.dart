import 'package:core/core.dart';
import 'package:dfinity_wallet/data/transaction_type.dart';
import 'package:hive/hive.dart';
import 'package:dfinity_wallet/dfinity.dart';


class Transaction extends HiveObject {
  final String from;
  final String to;
  final String doms;
  final DateTime date;
  final String fee;
  final TransactionType type;
  final BigInt memo;
  final bool incomplete;
  final BigInt blockHeight;

  Transaction(
      {required this.from,
      required this.to,
      required this.doms,
      required this.date,
      required this.fee,
      required this.type,
      required this.memo,
      required this.incomplete,
      required this.blockHeight});

  double get icpt => doms.toBigInt.toICPT;
}
