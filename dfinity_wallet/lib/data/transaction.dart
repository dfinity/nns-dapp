import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/data/transaction_type.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:dfinity_wallet/dfinity.dart';

part 'transaction.g.dart';

@HiveType(typeId: 106)
class Transaction extends HiveObject {
  @HiveField(0)
  final String from;
  @HiveField(1)
  final String to;
  @HiveField(2)
  final String doms;
  @HiveField(3)
  final DateTime date;
  @HiveField(4)
  final String fee;
  @HiveField(5)
  final TransactionType type;
  @HiveField(6)
  final BigInt memo;
  @HiveField(7)
  final bool incomplete;
  @HiveField(8)
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
