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
  @HiveField(4)
  final String domsAmount;
  @HiveField(3)
  final DateTime date;

  Transaction(
      {required this.from, required this.to, required this.domsAmount, required this.date});


  double get icptAmount => domsAmount.toICPT;
}
