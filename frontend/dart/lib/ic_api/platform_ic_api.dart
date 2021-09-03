import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/web/hardware_wallet_api.dart';
import 'package:dfinity_wallet/ic_api/web/neuron_sync_service.dart';
import 'package:dfinity_wallet/ic_api/web/service_api.dart';
import 'package:oxidized/oxidized.dart';

import '../dfinity.dart';

abstract class AbstractPlatformICApi {
  final HiveBoxesWidget hiveBoxes;

  AbstractPlatformICApi(this.hiveBoxes);

  void authenticate(Function onAuthenticate);

  bool isLoggedIn();
  Future initialize();

  Future<void> buildServices(dynamic identity);

  Future<void> refreshAccounts();

  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms});

  Future<void> makeDummyProposals({required BigInt neuronId});

  Future<void> createSubAccount({required String name});

  Future<Result<Unit, Exception>> sendICP(
      {
      required String fromAccount,
      required String toAccount,
      required ICP amount,
      int? fromSubAccount});

  Future<Result<NeuronId, Exception>> stakeNeuron(
      Account account, ICP stakeAmount);

  Future<Result<Unit, Exception>> startDissolving({required Neuron neuron});

  Future<Result<Unit, Exception>> stopDissolving({required Neuron neuron});

  Future<Result<Unit, Exception>> increaseDissolveDelay(
      {required Neuron neuron, required int additionalDissolveDelaySeconds});

  Future<Neuron> spawnNeuron({required Neuron neuron});

  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees});

  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote});

  Future<Result<Unit, Exception>> disburse(
      {required Neuron neuron,
      required ICP amount,
      required String toAccountId});

  Future<void> mergeMaturity(
      {required BigInt neuronId, required int percentageToMerge});

  Future<Result<Unit, Exception>> addHotkey(
      {required BigInt neuronId, required String principal});

  Future<Result<Unit, Exception>> removeHotkey(
      {required Neuron neuron, required String principal});

  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
      required List<ProposalRewardStatus> includeRewardStatus,
      Proposal? beforeProposal});

  Future<Proposal> fetchProposal({required BigInt proposalId});

  Future<Neuron?> fetchNeuron({required BigInt neuronId});

  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId});

  // Canisters
  Future<CreateCanisterResponse> createCanister(
      {required ICP amount, int? fromSubAccountId});

  Future<void> topUpCanister(
      {required ICP amount, int? fromSubAccountId, required String canisterId});

  Future<AttachCanisterResult> attachCanister(
      {required String name, required String canisterId});

  Future<void> getCanisters();

  Future<BigInt> getICPToCyclesExchangeRate();

  Future<void> getCanister(String canisterId);

  Future<void> changeCanisterControllers(
      String canisterId, List<String> newControllers);

  Future<void> test();

  Future<Result<dynamic, Exception>> connectToHardwareWallet();

  Future<HardwareWalletApi> createHardwareWalletApi({dynamic ledgerIdentity});

  Future<void> registerHardwareWallet(
      {required String name, dynamic ledgerIdentity});

  Future<void> renameSubAccount(
      {required String accountIdentifier, required String newName});

  Future<void> refreshNeurons();

  Future<void> refreshCanisters();

  Future<void> detachCanister(String canisterId);

  Future<void> refreshAccount(Account account);

  String getPrincipal();

  Future<void> logout();

  int? getTimeUntilSessionExpiryMs();

  Account? getAccountByPrincipal(String principal);

  bool isNeuronControllable(Neuron neuron);
}
