import 'package:dfinity_wallet/data/wallet.dart';

import 'canister.dart';

class AppState {
    static AppState shared = AppState();
    List<Canister> canisters = [];
    List<Wallet> wallets = [];
}