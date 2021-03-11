import 'package:dfinity_wallet/data/transaction.dart';

class Wallet {
    final String publicKey;
    Wallet(this.publicKey);
}

class WalletService {
    static Wallet fetchWallet() => Wallet("123456890");
}