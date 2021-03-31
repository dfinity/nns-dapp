import 'package:dfinity_wallet/data/auth_token.dart';
import 'package:dfinity_wallet/data/auth_token.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/neuron.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

class HiveBoxes {
  Box<Canister>? canisters;
  Box<Wallet>? wallets;
  Box<Neuron>? neurons;
  Box<Proposal>? proposals;
  Box<AuthToken>? authToken;

  bool get areClosed =>
      canisters == null || wallets == null || neurons == null ||
          proposals == null || authToken == null;

  HiveBoxes({this.canisters,
    this.wallets,
    this.neurons,
    this.proposals,
    this.authToken});
}

class HiveCoordinator {
  HiveBoxes hiveBoxes = HiveBoxes();

  static Future? hiveInitFuture;
  Future<dynamic>? loadingFuture;

  HiveCoordinator() {
    openBoxes();
  }

  bool get boxesClosed => hiveBoxes.areClosed;

  Future<void> openBoxes() async {
    if (boxesClosed) {
      if (hiveInitFuture == null) {
        hiveInitFuture = initializeHive();
        await hiveInitFuture;
      } else {
        await hiveInitFuture;
      }
      if (loadingFuture == null) {
        loadingFuture = Future.wait([
          Hive.openBox<Canister>('canisters').then((value) => hiveBoxes.canisters = value),
          Hive.openBox<Wallet>('wallets').then((value) => hiveBoxes.wallets = value),
          Hive.openBox<Neuron>('neurons').then((value) => hiveBoxes.neurons = value),
          Hive.openBox<Proposal>('proposals').then((value) => hiveBoxes.proposals = value),
          Hive.openBox<AuthToken>('auth_token').then((value) => hiveBoxes.authToken = value)
        ]);
      }
      await loadingFuture;
    }
  }

  Future initializeHive() async {
    await Hive.initFlutter();
    Hive.registerAdapter(WalletAdapter());
    Hive.registerAdapter(TransactionAdapter());
    Hive.registerAdapter(NeuronAdapter());
    Hive.registerAdapter(CanisterAdapter());
    Hive.registerAdapter(ProposalAdapter());
    Hive.registerAdapter(AuthTokenAdapter());
  }

  void clearData() {
    Hive.deleteFromDisk();
  }
}
