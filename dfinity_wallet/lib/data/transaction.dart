
import 'dart:async';

import 'package:dfinity_wallet/data/wallet.dart';

class Transaction{
    final String fromKey;
    final String toKey;
    final double amount;

    Transaction(this.fromKey, this.toKey, this.amount);
}

class TransactionService {

    final Wallet wallet;
    final StreamController<List<Transaction>> streamController = StreamController();

    TransactionService(this.wallet);
    void fetchTransactionsForWallet(Wallet wallet) {
        streamController.add([
            Transaction("", "", 0.0)
        ]);
    }

    void close() => streamController.close();
}