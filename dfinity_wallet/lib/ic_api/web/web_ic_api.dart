@JS()
library dfinity_agent.js;

import 'dart:convert';
import 'dart:js_util';

import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ic_api/web/proposal_sync_service.dart';
import 'package:dfinity_wallet/ic_api/web/transaction_sync_service.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../../dfinity.dart';
import 'account_sync_service.dart';
import 'auth_api.dart';
import 'balance_sync_service.dart';
import 'js_utils.dart';
import 'service_api.dart';
import 'hardware_wallet_api.dart';
import 'neuron_sync_service.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'stringify.dart';

class PlatformICApi extends AbstractPlatformICApi {
  late AuthApi authApi;
  ServiceApi? serviceApi;
  AccountsSyncService? accountsSyncService;
  BalanceSyncService? balanceSyncService;
  TransactionSyncService? transactionSyncService;
  NeuronSyncService? neuronSyncService;
  ProposalSyncService? proposalSyncService;

  dynamic? identity;

  bool isLoggedIn() => authApi.tryGetIdentity() != null;

  PlatformICApi(HiveBoxesWidget hiveBoxes) : super(hiveBoxes);

  Future initialize() async {
    authApi = await promiseToFuture(createAuthApi());
    fetchIdentityAndBuildServices();
  }

  @override
  void authenticate(Function onAuthenticated) async {
    promiseToFuture(authApi.login(allowInterop(() {
      fetchIdentityAndBuildServices();
      onAuthenticated();
    })));
  }

  void fetchIdentityAndBuildServices() {
    print("fetchIdentityAndBuildServices");
    identity = authApi.tryGetIdentity();
    if (identity != null) {
      buildServices(identity);
    }
  }

  final gatewayHost = "https://cdtesting.dfinity.network/";

  Future<void> buildServices(dynamic identity) async {
    print(stringify(identity));
    serviceApi = createServiceApi(gatewayHost, identity);

    accountsSyncService = AccountsSyncService(serviceApi!, hiveBoxes);
    balanceSyncService = BalanceSyncService(serviceApi!, hiveBoxes);
    transactionSyncService =
        TransactionSyncService(serviceApi: serviceApi!, hiveBoxes: hiveBoxes);
    neuronSyncService =
        NeuronSyncService(serviceApi: serviceApi!, hiveBoxes: hiveBoxes);
    proposalSyncService =
        ProposalSyncService(serviceApi: serviceApi!, hiveBoxes: hiveBoxes);

    await accountsSyncService!.performSync();
    await balanceSyncService!.syncBalances();
    await transactionSyncService!.syncAccount(hiveBoxes.accounts.primary);
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms}) async {
    await serviceApi!.acquireICPTs(accountIdentifier, doms).toFuture();
    await balanceSyncService!.syncBalances();
  }

  @override
  Future<void> createSubAccount({required String name}) async {
    await promiseToFuture(serviceApi!.createSubAccount(name)).then((value) {
      final json = jsonDecode(stringify(value));
      final res = json['Ok'];
      accountsSyncService!.storeSubAccount(res);
    });
  }

  @override
  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt e8s,
      int? fromSubAccount}) async {
    await promiseToFuture(serviceApi!.sendICPTs(SendICPTsRequest(
        to: toAccount, amount: e8s.toJS, fromSubAccountId: fromSubAccount)));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.accounts.primary)
    ]);
  }

  @override
  Future<void> createNeuron(
      {required BigInt stakeInDoms, int? fromSubAccount}) async {
    await promiseToFuture(serviceApi!.createNeuron(CreateNeuronRequest(
        stake: stakeInDoms, fromSubAccountId: fromSubAccount)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> startDissolving({required BigInt neuronId}) async {
    await promiseToFuture(serviceApi!
        .startDissolving(NeuronIdentifierRequest(neuronId: neuronId.toJS)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> stopDissolving({required BigInt neuronId}) async {
    await promiseToFuture(serviceApi!
        .stopDissolving(NeuronIdentifierRequest(neuronId: neuronId.toJS)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> disburse(
      {required BigInt neuronId,
      required BigInt doms,
      required String toAccountId}) async {
    final res = await promiseToFuture(serviceApi!.disburse(
        DisperseNeuronRequest(
            neuronId: neuronId.toJS,
            amount: doms.toJS,
            toAccountId: toAccountId)));
    await fetchNeuron(neuronId: neuronId);
    balanceSyncService?.syncBalances();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) async {
    final result = await promiseToFuture(serviceApi!.follow(FollowRequest(
        neuronId: toJSBigInt(neuronId.toString()),
        topic: topic.index,
        followees: followees.mapToList((e) => e.toJS))));

    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required int additionalDissolveDelaySeconds}) async {
    await promiseToFuture(
        serviceApi!.increaseDissolveDelay(IncreaseDissolveDelayRequest(
      neuronId: neuronId.toJS,
      additionalDissolveDelaySeconds: additionalDissolveDelaySeconds,
    )));
    await fetchNeuron(neuronId: neuronId);
  }

  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) async {
    final result = await Future.wait(neuronIds.map(
        (e) => promiseToFuture(serviceApi!.registerVote(RegisterVoteRequest(
              neuronId: e.toJS,
              proposal: proposalId.toJS,
              vote: vote.index,
            )))));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
      required List<ProposalRewardStatus> includeRewardStatus,
      Proposal? beforeProposal}) async {
    proposalSyncService?.fetchProposals(
        excludeTopics: excludeTopics,
        includeStatus: includeStatus,
        includeRewardStatus: includeRewardStatus,
        beforeProposal: beforeProposal);
  }

  @override
  Future<Neuron> fetchNeuron({required BigInt neuronId}) async {
    final res = await promiseToFuture(serviceApi!.getNeuron(neuronId.toJS));
    final neuronInfo = jsonDecode(stringify(res));
    return neuronSyncService!.storeNeuron(neuronInfo);
  }

  @override
  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId}) async {
    final res = await promiseToFuture(serviceApi!.getNeuron(neuronId.toJS));
    final neuronInfo = jsonDecode(stringify(res));
    final nInfo = NeuronInfo.fromResponse(neuronInfo);
    return nInfo;
  }

  @override
  Future<void> createDummyProposals({required BigInt neuronId}) async {
    await promiseToFuture(
        serviceApi!.createDummyProposals(neuronId.toString()));
    await fetchProposals(
        excludeTopics: [],
        includeStatus: ProposalStatus.values,
        includeRewardStatus: ProposalRewardStatus.values);
  }

  @override
  Future<Proposal> fetchProposal({required BigInt proposalId}) async {
    final response =
        await promiseToFuture(serviceApi!.getProposalInfo(proposalId.toJS));
    final json = jsonDecode(stringify(response));
    final proposal = await proposalSyncService!.storeProposal(json);
    proposalSyncService!.linkProposalsToNeurons();
    return Proposal.empty();
  }

  @override
  Future<dynamic> connectToHardwareWallet() {
    return promiseToFuture(authApi.connectToHardwareWallet());
  }

  @override
  Future<HardwareWalletApi> createHardwareWalletApi(
      {dynamic ledgerIdentity}) async {
    final identity = await promiseToFuture(authApi.connectToHardwareWallet());
    return HardwareWalletApi(gatewayHost, identity);
  }

  @override
  Future<void> test() async {
    await promiseToFuture(serviceApi!.integrationTest());
  }

  @override
  Future<void> registerHardwareWallet(
      {required String name, dynamic ledgerIdentity}) async {
    await promiseToFuture(
        serviceApi!.registerHardwareWallet(name, ledgerIdentity));
  }

  @override
  Future<void> refreshAccounts() async {
    await accountsSyncService!.performSync();
  }

  @override
  Future<Neuron> spawnNeuron({required BigInt neuronId}) async {
    final spawnResponse = await promiseToFuture(serviceApi!
        .spawn(SpawnRequest(neuronId: neuronId.toJS, newController: null)));
    // print("spawnResponse " + stringify(spawnResponse));
    final createdNeuronId = spawnResponse.createdNeuronId.toString();
    await neuronSyncService!.fetchNeurons();
    return hiveBoxes.neurons.values
        .firstWhere((element) => element.identifier == createdNeuronId);
  }

  @override
  Future<AttachCanisterResult> attachCanister(
      {required String name, required String canisterId}) async {
    final response = await promiseToFuture(serviceApi!.attachCanister(
        AttachCanisterRequest(
            name: name, canisterId: createPrincipal(canisterId))));
    return AttachCanisterResult.values[response.toInt()];
  }

  @override
  Future<CreateCanisterResponse> createCanister(
      {required BigInt stake,
      int? fromSubAccountId,
      required String name}) async {
    print(
        "CREATE CANISTER stake:${stake}, fromSubAccountId:${fromSubAccountId}, name:${name}");

    final res =
        await promiseToFuture(serviceApi!.createCanister(CreateCanisterRequest(
      stake: stake.toJS,
      fromSubAccountId: fromSubAccountId,
      name: name,
    )));

    await getCanisters();

    final response = jsonDecode(stringify(res));
    final canisterId = res.canisterId.toString();
    return CreateCanisterResponse(
        result:
            CreateCanisterResult.values[response['result']!.toString().toInt()],
        canisterId: canisterId,
        errorMessage: response['errorMessage'],
        canister:
            (canisterId != null) ? hiveBoxes.canisters.get(canisterId) : null);
  }

  @override
  Future<void> getCanisters() async {
    final response = await promiseToFuture(serviceApi!.getCanisters());

    await Future.wait(<Future>[
      ...response.map((e) async {
        final id = e.canisterId.toString();
        await hiveBoxes.canisters.put(
            id, Canister(name: e.name, publicKey: id, userIsController: null));
      })
    ]);
  }

  @override
  Future<BigInt> getICPToCyclesExchangeRate() async {
    final response =
        await promiseToFuture(serviceApi!.getIcpToCyclesConversionRate());
    final string = convertBigIntToString(response);
    print("getICPToCyclesExchangeRate ${string}");
    return BigInt.parse(string);
  }

  @override
  Future<void> topupCanister(
      {required BigInt stake,
      int? fromSubAccountId,
      required String targetCanisterId}) async {
    await promiseToFuture(serviceApi!.topupCanister(TopupCanisterRequest(
        stake: stake,
        fromSubAccountId: fromSubAccountId,
        targetCanisterId: createPrincipal(targetCanisterId))));
  }

  @override
  Future<void> getCanister(String canisterId) async {
    final res = await promiseToFuture(
        serviceApi!.getCanisterDetails(createPrincipal(canisterId)));
    final response = jsonDecode(stringify(res));
    final canister = hiveBoxes.canisters.get(canisterId)!;
    canister.userIsController = response['kind'] == "success";
    if (canister.userIsController == true) {
      final details = response['details'];
      canister.cyclesBalance = details['cycles'].toString();
      canister.controller = res.details.setting.controller.toString();
    }
    canister.save();
  }

  @override
  Future<void> changeCanisterController(
      String canisterId, String newController) async {
    final settings = UpdateSettingsRequest(
        canisterId: createPrincipal(canisterId),
        settings:
            UpdateCanisterSettings(controller: createPrincipal(newController)));
    await promiseToFuture(serviceApi!.updateCanisterSettings(settings));
    await getCanister(canisterId);
  }

  @override
  Future<void> renameSubAccount({required String accountIdentifier, required String newName}) async {
    print("renameSubAccount: accountIdentifier: ${accountIdentifier} newName: ${newName}");
    await promiseToFuture(serviceApi!.renameSubAccount(RenameSubAccountRequest(
      newName: newName,
      accountIdentifier: accountIdentifier,
    )));
    await accountsSyncService!.performSync();
  }
}
