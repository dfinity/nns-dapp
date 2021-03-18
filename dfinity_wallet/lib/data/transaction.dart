import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'transaction.g.dart';

@HiveType(typeId: 2)
class Transaction {
  @HiveField(0)
  final String? fromKey;
  @HiveField(1)
  final String? toKey;
  @HiveField(2)
  final double amount;
  @HiveField(3)
  final DateTime date;

  Transaction(
      {this.fromKey, this.toKey, required this.amount, required this.date});
}

class TransactionService {
  static Uuid uuid = Uuid();

  final Wallet wallet;
  final StreamController<List<Transaction>> streamController =
      StreamController.broadcast();
  List<Transaction> transactions = [];

  Stream<List<Transaction>> get stream => streamController.stream;

  TransactionService(this.wallet);

  void fetchTransactions() {
    transactions =
        1.rangeTo(5 + rand.nextInt(10)).mapToList((e) => generateTransaction());
    streamController.add(transactions);
  }

  Transaction generateTransaction() {
    bool out = rand.nextBool();
    return Transaction(
        fromKey: uuid.v4().takeIf((e) => out),
        toKey: uuid.v4().takeUnless((e) => out),
        amount: rand.nextDouble() * 20 * (out ? -1 : 1),
        date: DateTime.now());
  }

  void close() => streamController.close();
}
