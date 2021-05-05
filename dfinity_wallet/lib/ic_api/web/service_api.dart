@JS()
library dfinity_agent.js;

import 'package:js/js.dart';
import '../models.dart';
import 'js_utils.dart';

@JS('createServiceApi')
external ServiceApi createServiceApi(String host, dynamic identity);

@JS("ServiceApi")
class ServiceApi {
  external ServiceApi(String host, dynamic identity);

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

  @JS("createCanister")
  external Promise<void> createCanister(dynamic request);

  @JS("topupCanister")
  external Promise<void> topupCanister(dynamic request);

  @JS("integrationTest")
  external Promise<void> integrationTest();

  @JS("getTransactions")
  external Promise<dynamic> getTransactions(dynamic request);

  @JS("createDummyProposals")
  external Promise<dynamic> createDummyProposals(String neuronId);

  @JS("registerHardwareWallet")
  external Promise<void> registerHardwareWallet(String name, dynamic ledgerIdentity);

  @JS("getNeuron")
  external Promise<dynamic> getNeuron(dynamic neuronId);

  @JS("getNeurons")
  external Promise<dynamic> getNeurons();

  @JS("getPendingProposals")
  external Promise<dynamic> getPendingProposals();

  @JS("getProposalInfo")
  external Promise<dynamic> getProposalInfo(dynamic proposalId);

  @JS("listProposals")
  external Promise<dynamic> listProposals(dynamic request);

  @JS("addHotKey")
  external Promise<dynamic> addHotKey(dynamic request);

  @JS("removeHotKey")
  external Promise<dynamic> removeHotKey(dynamic request);

  @JS("startDissolving")
  external Promise<dynamic> startDissolving(dynamic request);

  @JS("stopDissolving")
  external Promise<dynamic> stopDissolving(dynamic request);

  @JS("increaseDissolveDelay")
  external Promise<dynamic> increaseDissolveDelay(dynamic request);

  @JS("follow")
  external Promise<dynamic> follow(dynamic request);

  @JS("registerVote")
  external Promise<dynamic> registerVote(dynamic request);

  @JS("spawn")
  external Promise<dynamic> spawn(dynamic request);

  @JS("split")
  external Promise<dynamic> split(dynamic request);

  @JS("disburse")
  external Promise<dynamic> disburse(dynamic request);

  @JS("disburseToNeuron")
  external Promise<dynamic> disburseToNeuron(dynamic request);

  @JS("makeMotionProposal")
  external Promise<dynamic> makeMotionProposal(dynamic request);
}
