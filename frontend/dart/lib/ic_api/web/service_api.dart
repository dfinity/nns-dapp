@JS()
library ic_agent.js;

import 'package:js/js.dart';
import '../../nns_dapp.dart';
import 'js_utils.dart';

@JS("createServiceApi")
external Promise<ServiceApi> createServiceApi(dynamic identity);

@JS("ServiceApi")
class ServiceApi {
  @JS("acquireICPTs")
  external Promise<void> acquireICPTs(String accountIdentifier, BigInt icpts);

  @JS("makeDummyProposals")
  external Promise<void> makeDummyProposals(dynamic neuronId);

  @JS("getAccount")
  external Promise<dynamic> getAccount(bool certified);

  @JS("getBalances")
  external Promise<dynamic> getBalances(Object request, bool useUpdateCalls);

  @JS("createSubAccount")
  external Promise<dynamic> createSubAccount(String name);

  @JS("updateCanisterSettings")
  external Promise<dynamic> updateCanisterSettings(dynamic settings);

  @JS("sendICP")
  external Promise<dynamic> sendICP(dynamic identity, Object request);

  @JS("createNeuron")
  external Promise<String> createNeuron(dynamic request);

  @JS("topUpNeuron")
  external Promise<void> topUpNeuron(dynamic request);

  @JS("integrationTest")
  external Promise<void> integrationTest();

  @JS("getTransactions")
  external Promise<dynamic> getTransactions(dynamic request, bool certified);

  @JS("registerHardwareWallet")
  external Promise<void> registerHardwareWallet(
      String name, dynamic ledgerIdentity);

  @JS("getNeuron")
  external Promise<dynamic> getNeuron(dynamic neuronId, bool certified);

  @JS("getNeurons")
  external Promise<dynamic> getNeurons(bool certified);

  @JS("checkNeuronBalances")
  external Promise<bool> checkNeuronBalances(dynamic neurons);

  @JS("getNeuronsForHw")
  external Promise<dynamic> getNeuronsForHw(dynamic identity);

  @JS("getPendingProposals")
  external Promise<dynamic> getPendingProposals();

  @JS("getProposalInfo")
  external Promise<dynamic> getProposalInfo(dynamic proposalId);

  @JS("listProposals")
  external Promise<dynamic> listProposals(dynamic request);

  @JS("addHotKey")
  external Promise<dynamic> addHotKey(dynamic request);

  @JS("removeHotKey")
  external Promise<dynamic> removeHotKey(dynamic identity, dynamic request);

  @JS("startDissolving")
  external Promise<dynamic> startDissolving(dynamic identity, dynamic request);

  @JS("stopDissolving")
  external Promise<dynamic> stopDissolving(dynamic identity, dynamic request);

  @JS("increaseDissolveDelay")
  external Promise<dynamic> increaseDissolveDelay(
      dynamic identity, dynamic request);

  @JS("joinCommunityFund")
  external Promise<dynamic> joinCommunityFund(
      dynamic identity, dynamic request);

  @JS("follow")
  external Promise<dynamic> follow(dynamic request);

  @JS("registerVote")
  external Promise<dynamic> registerVote(dynamic request);

  @JS("spawn")
  external Promise<dynamic> spawn(dynamic identity, dynamic request);

  @JS("split")
  external Promise<dynamic> split(dynamic identity, dynamic request);

  @JS("disburse")
  external Promise<dynamic> disburse(dynamic identity, dynamic request);

  @JS("disburseToNeuron")
  external Promise<dynamic> disburseToNeuron(dynamic request);

  @JS("merge")
  external Promise<dynamic> merge(dynamic identity, dynamic request);

  @JS("mergeMaturity")
  external Promise<dynamic> mergeMaturity(dynamic identity, dynamic request);

  @JS("makeMotionProposal")
  external Promise<dynamic> makeMotionProposal(dynamic request);

  @JS("createCanister")
  external Promise<dynamic> createCanister(CreateCanisterRequest request);

  @JS("topUpCanister")
  external Promise<void> topUpCanister(TopUpCanisterRequest request);

  @JS("attachCanister")
  external Promise<void> attachCanister(AttachCanisterRequest request);

  @JS("getCanisterDetails")
  external Promise<void> getCanisterDetails(dynamic canisterId);

  @JS("getCanisters")
  external Promise<dynamic> getCanisters(bool certified);

  @JS("getIcpToCyclesConversionRate")
  external Promise<double> getIcpToCyclesConversionRate();

  @JS("renameSubAccount")
  external Promise<double> renameSubAccount(RenameSubAccountRequest request);

  @JS("detachCanister")
  external Promise<double> detachCanister(DetachCanisterRequest request);

  @JS("followeeSuggestions")
  external Promise<dynamic> followeeSuggestions(bool certified);

  @JS("principalToAccountIdentifier")
  external String principalToAccountIdentifier(String principal);
}

@JS()
@anonymous
class IncreaseDissolveDelayRequest {
  external String get neuronId;

  external num get additionalDissolveDelaySeconds;

  external factory IncreaseDissolveDelayRequest(
      {dynamic neuronId, num additionalDissolveDelaySeconds});
}

@JS()
@anonymous
class JoinCommunityFundRequest {
  external dynamic get neuronId;

  external factory JoinCommunityFundRequest(
      {dynamic neuronId});
}

@JS()
@anonymous
class FollowRequest {
  external dynamic neuronId;
  external int topic;
  external List<dynamic> followees;

  external factory FollowRequest(
      {dynamic neuronId, int topic, List<dynamic> followees});
}

@JS()
@anonymous
class SplitNeuronRequest {
  external dynamic get neuronId;
  external dynamic get amount;

  external factory SplitNeuronRequest(
      {dynamic neuronId, dynamic amount});
}

@JS()
@anonymous
class NeuronIdentifierRequest {
  external dynamic neuronId;

  external factory NeuronIdentifierRequest({dynamic neuronId});
}

@JS()
@anonymous
class CreateNeuronRequest {
  external dynamic stake;
  external int? fromSubAccountId;

  external factory CreateNeuronRequest({dynamic stake, int? fromSubAccountId});
}

@JS()
@anonymous
class TopUpNeuronRequest {
  external String neuronAccountIdentifier;
  external dynamic stake;
  external int? fromSubAccountId;

  external factory TopUpNeuronRequest(
      {String neuronAccountIdentifier, dynamic amount, int? fromSubAccountId});
}

@JS()
@anonymous
class DisburseNeuronRequest {
  external dynamic neuronId;
  external dynamic amount;
  external String? toAccountId;

  external factory DisburseNeuronRequest(
      {dynamic neuronId, dynamic amount, String? toAccountId});
}

@JS()
@anonymous
class MergeRequest {
  external dynamic neuronId;
  external dynamic sourceNeuronId;

  external factory MergeRequest(
      {dynamic neuronId, dynamic sourceNeuronId});
}

@JS()
@anonymous
class MergeMaturityRequest {
  external dynamic neuronId;
  external int percentageToMerge;

  external factory MergeMaturityRequest(
      {dynamic neuronId, int percentageToMerge});
}

@JS()
@anonymous
class AddHotkeyRequest {
  external dynamic neuronId;
  external String principal;

  external factory AddHotkeyRequest({dynamic neuronId, String principal});
}

@JS()
@anonymous
class RemoveHotkeyRequest {
  external dynamic neuronId;
  external String principal;

  external factory RemoveHotkeyRequest({dynamic neuronId, String principal});
}

@JS()
@anonymous
class SendICPRequest {
  external dynamic to;
  external dynamic amount;
  external int? fromSubAccountId;

  external factory SendICPRequest(
      {dynamic to, dynamic amount, int? fromSubAccountId});
}

@JS()
@anonymous
class RegisterVoteRequest {
  external dynamic neuronId;
  external dynamic proposal;
  external int vote;

  external factory RegisterVoteRequest(
      {dynamic neuronId, dynamic proposal, int vote});
}

@JS()
@anonymous
class SpawnRequest {
  external dynamic neuronId;
  external dynamic newController;
  external int? percentageToSpawn;

  external factory SpawnRequest({dynamic neuronId, int? percentageToSpawn, dynamic newController});
}

@JS()
@anonymous
class CreateCanisterRequest {
  external dynamic amount;
  external int? fromSubAccountId;

  external factory CreateCanisterRequest(
      {dynamic amount, int? fromSubAccountId});
}

@JS()
@anonymous
class TopUpCanisterRequest {
  external dynamic amount;
  external int? fromSubAccountId;
  external dynamic canisterId;

  external factory TopUpCanisterRequest(
      {dynamic amount, int? fromSubAccountId, dynamic canisterId});
}

@JS()
@anonymous
class AttachCanisterRequest {
  external String name;
  external dynamic canisterId;

  external factory AttachCanisterRequest({String name, dynamic canisterId});
}

@JS()
@anonymous
class UpdateSettingsRequest {
  external dynamic canisterId;
  external UpdateCanisterSettings settings;

  external factory UpdateSettingsRequest(
      {dynamic canisterId, UpdateCanisterSettings settings});
}

@JS()
@anonymous
class UpdateCanisterSettings {
  dynamic controllers;

  external factory UpdateCanisterSettings({dynamic controllers});
}

enum AttachCanisterResult {
  Ok,
  CanisterAlreadyAttached,
  NameAlreadyTaken,
  CanisterLimitExceeded,
}

class CreateCanisterResponse {
  final String? canisterId;
  final Canister? canister;
  final bool refunded;
  final String? errorMessage;

  CreateCanisterResponse(
      {this.canisterId,
      this.canister,
      required this.refunded,
      this.errorMessage});
}

@JS()
@anonymous
class RenameSubAccountRequest {
  external String newName;
  external String accountIdentifier;

  external factory RenameSubAccountRequest(
      {String newName, String accountIdentifier});
}

@JS()
@anonymous
class DetachCanisterRequest {
  external dynamic canisterId;

  external factory DetachCanisterRequest({dynamic canisterId});
}
