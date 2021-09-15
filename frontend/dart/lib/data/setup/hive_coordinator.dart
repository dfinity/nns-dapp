import '../data.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:observable/observable.dart';

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
