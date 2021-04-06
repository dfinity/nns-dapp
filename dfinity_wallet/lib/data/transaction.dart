import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:dfinity_wallet/dfinity.dart';

part 'transaction.g.dart';

@HiveType(typeId: 2)
class Transaction extends HiveObject {
  @HiveField(0)
  final String from;
  @HiveField(1)
  final String to;
  @HiveField(2)
  final BigInt doms;
  @HiveField(3)
  final DateTime date;
  @HiveField(4)
  final BigInt fee;

  Transaction(
      {required this.from, required this.to, required this.doms, required this.date, required this.fee});

  double get icpt => doms.toICPT;
}
