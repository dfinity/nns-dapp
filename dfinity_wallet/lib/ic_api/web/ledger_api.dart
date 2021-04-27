@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'js_utils.dart';

@JS('createLedgerApi')
external LedgerApi createLedgerApi(String host, dynamic identity);

@JS("LedgerApi")
class LedgerApi {
  external factory LedgerApi(String host, dynamic identity);

  @JS("acquireICPTs")
  external Promise<void> acquireICPTs(String accountIdentifier, BigInt icpts);

  @JS("getAccount")
  external Promise<dynamic> getAccount();

  @JS("getBalances")
  external Promise<dynamic> getBalances(Object request);

  @JS("createSubAccount")
  external Promise<dynamic> createSubAccount(String name);

  @JS("sendICPTs")
  external Promise<dynamic> sendICPTs(Object request);

  @JS("createNeuron")
  external Promise<void> createNeuron(dynamic request);

  @JS("integrationTest")
  external Promise<void> integrationTest();

  @JS("getTransactions")
  external Promise<dynamic> getTransactions(dynamic request);

  @JS("createDummyProposals")
  external Promise<dynamic> createDummyProposals(String neuronId);
}
