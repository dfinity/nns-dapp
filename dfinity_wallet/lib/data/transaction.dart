import 'dart:async';

import 'package:core/core.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:uuid/uuid.dart';

class Transaction {
  final String? fromKey;
  final String? toKey;
  final double amount;

  Transaction({this.fromKey, this.toKey, required this.amount});
}

class TransactionService {
  static Uuid uuid = Uuid();

  final Wallet wallet;
  final StreamController<List<Transaction>> streamController = StreamController.broadcast();
  List<Transaction> transactions = [];

  Stream<List<Transaction>> get stream => streamController.stream;

  TransactionService(this.wallet);

  void fetchTransactions() {
    transactions = 1.rangeTo(5 + rand.nextInt(10)).mapToList((e) => generateTransaction());
    streamController.add(transactions);
  }

  Transaction generateTransaction() {
    bool out = rand.nextBool();
    return Transaction(
        fromKey: uuid.v4().takeIf((e) => out),
        toKey: uuid.v4().takeUnless((e) => out),
        amount: rand.nextDouble() * 20 * (out ? -1 : 1));
  }

  void close() => streamController.close();
}
