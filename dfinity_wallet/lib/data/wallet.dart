import 'dart:math';

import 'package:dfinity_wallet/data/transaction.dart';
import 'package:uuid/uuid.dart';
import 'package:dartx/dartx.dart';

class Wallet {
    final String name;
    final String publicKey;
    Wallet(this.name, this.publicKey);

    List<Transaction> transactions = [];
    double get balance => transactions.sumBy((element) => element.amount);
}

class WalletService {
    static Uuid uuid = Uuid();
    static Wallet demoWallet() => Wallet("Wallet ${Random().nextInt(10)}", uuid.v4());
}