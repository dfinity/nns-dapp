import 'dart:math';

import 'package:dfinity_wallet/data/transaction.dart';
import 'package:uuid/uuid.dart';

class Wallet {
    final String name;
    final String publicKey;
    Wallet(this.name, this.publicKey);
}

class WalletService {
    static Uuid uuid = Uuid();
    static Wallet demoWallet() => Wallet("Wallet ${Random().nextInt(10)}", uuid.v4());
}