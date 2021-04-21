import 'package:dfinity_wallet/data/auth_token.dart';
import 'package:dfinity_wallet/data/auth_token.dart';
import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/followee.dart';
import 'package:dfinity_wallet/data/neuron.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../neuron_state.dart';
import '../topic.dart';
import '../vote.dart';

class HiveBoxes {
  Box<Canister>? canisters;
  Box<Account>? accounts;
  Box<Neuron>? neurons;
  Box<Proposal>? proposals;
  Box<AuthToken>? authToken;

  bool get areClosed =>
      canisters == null ||
          accounts == null ||
      neurons == null ||
      proposals == null ||
      authToken == null;

  HiveBoxes(
      {this.canisters,
      this.accounts,
      this.neurons,
      this.proposals,
      this.authToken});
}

final PENDING_OBJECT_KEY = "pending_";

class HiveCoordinator {
  HiveBoxes hiveBoxes = HiveBoxes();

  static Future? hiveInitFuture;
  static Future<dynamic>? loadingFuture;

  HiveCoordinator() {
    performInitialisation();
  }

  bool get boxesClosed => hiveBoxes.areClosed;

  Future<void> performInitialisation() async {

    if (boxesClosed) {
      if (hiveInitFuture == null) {
        hiveInitFuture = initializeHive();
        await hiveInitFuture;
      } else {
        await hiveInitFuture;
      }
      if (loadingFuture == null) {
        loadingFuture = openAllBoxes();
      }
      await loadingFuture;
    }
  }

  Future<List<Box<HiveObject>>> openAllBoxes() {
    return Future.wait([
      Hive.openBox<Canister>('canisters')
          .then((value) => hiveBoxes.canisters = value),
      Hive.openBox<Account>('wallets')
          .then((value) => hiveBoxes.accounts = value),
      Hive.openBox<Neuron>('neurons')
          .then((value) => hiveBoxes.neurons = value),
      Hive.openBox<Proposal>('proposals')
          .then((value) => hiveBoxes.proposals = value),
      Hive.openBox<AuthToken>('auth_token')
          .then((value) => hiveBoxes.authToken = value)
    ]);
  }

  Future initializeHive() async {
    Hive.registerAdapter<Account>(AccountAdapter());
    Hive.registerAdapter<Canister>(CanisterAdapter());
    Hive.registerAdapter<Neuron>(NeuronAdapter());
    Hive.registerAdapter<AuthToken>(AuthTokenAdapter());
    Hive.registerAdapter<Proposal>(ProposalAdapter());
    Hive.registerAdapter<Transaction>(TransactionAdapter());
    Hive.registerAdapter<BallotInfo>(BallotInfoAdapter());
    Hive.registerAdapter<Followee>(FolloweeAdapter());
    Hive.registerAdapter<Topic>(TopicAdapter());
    Hive.registerAdapter<Vote>(VoteAdapter());
    Hive.registerAdapter<NeuronState>(NeuronStateAdapter());
    await Hive.initFlutter();
  }

  Future<void> deleteAllData() async {
    await Future.wait([
      hiveBoxes.canisters,
      hiveBoxes.accounts,
      hiveBoxes.neurons,
      hiveBoxes.proposals,
      hiveBoxes.authToken
    ].map((element) async {
      await element?.deleteAll(element.keys);
    }));
  }
}
