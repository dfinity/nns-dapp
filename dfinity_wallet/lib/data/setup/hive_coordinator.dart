import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/data/followee.dart';
import 'package:dfinity_wallet/data/neuron.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/transaction.dart';
import 'package:dfinity_wallet/data/transaction_type.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:observable/observable.dart';

import '../neuron_state.dart';
import '../proposal_reward_status.dart';
import '../topic.dart';
import '../vote.dart';

class HiveBoxes {
  ObservableMap<String, Canister> canisters = ObservableMap.linked();
  ObservableMap<String, Account> accounts = ObservableMap.linked();
  ObservableMap<String, Neuron> neurons = ObservableMap.linked();
  ObservableMap<String, Proposal> proposals = ObservableMap.linked();

  deleteAllData() {
    canisters.removeWhere((k, v) => true);
    accounts.removeWhere((k, v) => true);
    neurons.removeWhere((k, v) => true);
    proposals.removeWhere((k, v) => true);
  }

}