import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ic_api/web/hardware_wallet_api.dart';
import 'package:dfinity_wallet/ic_api/web/neuron_sync_service.dart';
import 'package:dfinity_wallet/ic_api/web/service_api.dart';
import 'package:flutter/services.dart';
import 'web/service_api.dart';

import '../dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi {

  static const platformChannel = const MethodChannel('internet_computer.signing');

  PlatformICApi(HiveBoxesWidget hiveBoxes) : super(hiveBoxes);

  @override
  void authenticate(Function onAuthenticate){
    final walletId = "".replaceAll(" ", "_");
    // Map<String, dynamic> response =
    //         await platformChannel.invokeMapMethod("generateKey", {"walletId": walletId}) ?? {};
    // final address = response["publicKey"];
    // return address;
  }

  Future<void> buildServices(dynamic identity) async {

  }

  @override
  Future<void> acquireICPTs({required String accountIdentifier, required BigInt doms}) {
    // TODO: implement acquireICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> createNeuron({required ICP stake, int? fromSubAccount}) {
    // TODO: implement createNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> createSubAccount({required String name}) {
    // TODO: implement createSubAccount
    throw UnimplementedError();
  }

  @override
  Future<void> disburse({required BigInt neuronId, required ICP amount, required String toAccountId}) {
    // TODO: implement disburse
    throw UnimplementedError();
  }

  @override
  Future<void> disburseToNeuron({required BigInt neuronId, required BigInt dissolveDelaySeconds, required BigInt doms}) {
    // TODO: implement disburseToNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
        required Topic topic,
        required List<BigInt> followees}){
    // TODO: implement follow
    throw UnimplementedError();
  }

  @override
  Future<void> increaseDissolveDelay({required BigInt neuronId, required int additionalDissolveDelaySeconds}) {
    // TODO: implement increaseDissolveDelay
    throw UnimplementedError();
  }

  @override
  Future<void> makeMotionProposal({required BigInt neuronId, required String url, required String text, required String summary}) {
    // TODO: implement makeMotionProposal
    throw UnimplementedError();
  }

  @override
  Future<void> registerVote({required List<BigInt> neuronIds, required BigInt proposalId, required Vote vote}) {
    // TODO: implement registerVote
    throw UnimplementedError();
  }

  @override
  Future<void> sendICPTs({required String toAccount, required ICP amount, int? fromSubAccount}) {
    // TODO: implement sendICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> startDissolving({required BigInt neuronId}) {
    // TODO: implement startDissolving
    throw UnimplementedError();
  }

  @override
  Future<void> stopDissolving({required BigInt neuronId}) {
    // TODO: implement stopDissolving
    throw UnimplementedError();
  }

  @override
  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
        required List<ProposalStatus> includeStatus,
        required List<ProposalRewardStatus> includeRewardStatus,
        Proposal? beforeProposal}) {
    throw UnimplementedError();
  }

  @override
  Future<Neuron> fetchNeuron({required BigInt neuronId}) {
    // TODO: implement getNeuron
    throw UnimplementedError();
  }

  @override
  Future<Proposal> fetchProposal({required BigInt proposalId}) {
    // TODO: implement fetchProposalInfo
    throw UnimplementedError();
  }

  @override
  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId}) {
    // TODO: implement fetchNeuronInfo
    throw UnimplementedError();
  }


  @override
  Future<void> test() {
    // TODO: implement test
    throw UnimplementedError();
  }

  @override
  Future connectToHardwareWallet() {
    // TODO: implement connectToHardwareWallet
    throw UnimplementedError();
  }

  @override
  Future<HardwareWalletApi> createHardwareWalletApi({ledgerIdentity}) {
    // TODO: implement createHardwareWalletApi
    throw UnimplementedError();
  }

  @override
  Future<void> registerHardwareWallet(
      {required String name, dynamic ledgerIdentity})async {

  }

  @override
  Future<void> refreshAccounts() {
    // TODO: implement refreshAccounts
    throw UnimplementedError();
  }

  @override
  Future<Neuron> spawnNeuron({required BigInt neuronId}) {
    throw UnimplementedError();
  }

  @override
  Future<AttachCanisterResult> attachCanister({required String name, required String canisterId}) {
    // TODO: implement attachCanister
    throw UnimplementedError();
  }

  @override
  Future<CreateCanisterResponse> createCanister({required ICP amount, int? fromSubAccountId, required String name}) {
    // TODO: implement createCanister
    throw UnimplementedError();
  }

  @override
  Future<void> getCanisters() {
    // TODO: implement getCanisters
    throw UnimplementedError();
  }

  @override
  Future<BigInt> getICPToCyclesExchangeRate() {
    // TODO: implement getICPToCyclesExchangeRate
    throw UnimplementedError();
  }

  @override
  Future<void> topupCanister({required ICP amount, int? fromSubAccountId, required String targetCanisterId}) {
    // TODO: implement topupCanister
    throw UnimplementedError();
  }

  @override
  Future<void> getCanister(String canisterId) {
    // TODO: implement updateCanister
    throw UnimplementedError();
  }

  @override
  Future<void> changeCanisterController(String canisterId, String newController) {
    // TODO: implement changeCanisterController
    throw UnimplementedError();
  }

  @override
  bool isLoggedIn() {
    // TODO: implement isLoggedIn
    throw UnimplementedError();
  }

  @override
  Future initialize() {
    // TODO: implement initialize
    throw UnimplementedError();
  }

  @override
  Future<void> renameSubAccount({required String accountIdentifier, required String newName}) {
    throw UnimplementedError();
  }

  @override
  Future<void> refreshNeurons() {
    // TODO: implement refreshNeurons
    throw UnimplementedError();
  }

  @override
  Future<void> refreshCanisters() {
    // TODO: implement refreshCanisters
    throw UnimplementedError();
  }

  @override
  Future<void> detachCanister(String canisterId) {
    // TODO: implement detachCanister
    throw UnimplementedError();
  }

  @override
  Future<void> refreshAccount(Account account) {
    // TODO: implement refreshAccount
    throw UnimplementedError();
  }

  @override
  String getPrincipal() {
    // TODO: implement getPrincipal
    throw UnimplementedError();
  }

  @override
  Future<void> logout() {
    // TODO: implement logout
    throw UnimplementedError();
  }

  @override
  int getTimeUntilSessionExpiryMs() {
    // TODO: implement getTimeUntilSessionExpiryMs
    throw UnimplementedError();
  }

  @override
  Future<void> changeCanisterControllers(String canisterId, List<String> newControllers) {
    // TODO: implement changeCanisterControllers
    throw UnimplementedError();
  }
}