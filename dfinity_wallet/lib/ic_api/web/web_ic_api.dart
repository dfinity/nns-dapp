@JS()
library dfinity_agent.js;

import 'dart:html' as html;
import 'dart:convert';
import 'dart:js_util';

import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ic_api/web/proposal_sync_service.dart';
import 'package:dfinity_wallet/ic_api/web/transaction_sync_service.dart';
import 'package:js/js.dart';

import '../../dfinity.dart';
import 'account_sync_service.dart';
import 'auth_api.dart';
import 'balance_sync_service.dart';
import 'js_utils.dart';
import 'service_api.dart';
import 'hardware_wallet_api.dart' as hardwareWalletApi;
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
    authApi = await promiseToFuture(createAuthApi(allowInterop((){
      html.window.location.reload();
    })));
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
    identity = authApi.tryGetIdentity();
    if (identity != null) {
      buildServices(identity);
    }
  }

  Future<void> buildServices(dynamic identity) async {
    serviceApi = await promiseToFuture(createServiceApi(identity));

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
    getCanisters();
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
      required ICP amount,
      int? fromSubAccount}) async {
    await promiseToFuture(serviceApi!.sendICPTs(SendICPTsRequest(
        to: toAccount, amount: amount.asE8s().toJS, fromSubAccountId: fromSubAccount)));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.accounts.primary)
    ]);
  }

  @override
  Future<void> createNeuron(
      {required ICP stake, int? fromSubAccount}) async {
    await promiseToFuture(serviceApi!.createNeuron(CreateNeuronRequest(
        stake: stake.asE8s().toJS, fromSubAccountId: fromSubAccount)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> retryStakeNeuronNotification(
      {required BigInt blockHeight,
        required BigInt nonce,
        int? fromSubAccount}) async {
    await promiseToFuture(serviceApi!.retryStakeNeuronNotification(RetryStakeNeuronNotificationRequest(
        blockHeight: blockHeight.toJS, nonce: nonce.toJS, fromSubAccountId: fromSubAccount)));
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
      required ICP amount,
      required String toAccountId}) async {
    final res = await promiseToFuture(serviceApi!.disburse(
        DisperseNeuronRequest(
            neuronId: neuronId.toJS,
            amount: null,
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
  Future<Proposal> fetchProposal({required BigInt proposalId}) async {
    final response =
        await promiseToFuture(serviceApi!.getProposalInfo(proposalId.toJS));
    final json = jsonDecode(stringify(response));
    return proposalSyncService!.storeProposal(json);
  }

  @override
  Future<dynamic> connectToHardwareWallet() {
    return promiseToFuture(authApi.connectToHardwareWallet());
  }

  @override
  Future<hardwareWalletApi.HardwareWalletApi> createHardwareWalletApi(
      {dynamic ledgerIdentity}) async {
    final identity = await promiseToFuture(authApi.connectToHardwareWallet());
    return await promiseToFuture(hardwareWalletApi.createHardwareWalletApi(identity));
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
    balanceSyncService!.syncBalances();
    transactionSyncService!.syncAccount(hiveBoxes.accounts.primary);
  }

  @override
  Future<Neuron> spawnNeuron({required BigInt neuronId}) async {
    final spawnResponse = await promiseToFuture(serviceApi!
        .spawn(SpawnRequest(neuronId: neuronId.toJS, newController: null)));
    dynamic response = jsonDecode(stringify(spawnResponse));
    final createdNeuronId = response['createdNeuronId'].toString();
    await neuronSyncService!.fetchNeurons();
    return hiveBoxes.neurons.values
        .firstWhere((element) => element.identifier == createdNeuronId);
  }

  @override
  Future<AttachCanisterResult> attachCanister(
      {required String name, required String canisterId}) async {
    final response = await promiseToFuture(serviceApi!.attachCanister(
        AttachCanisterRequest(
            name: name, canisterId: canisterId)));
    return AttachCanisterResult.values[response.toInt()];
  }

  @override
  Future<CreateCanisterResponse> createCanister(
      {required ICP amount,
      int? fromSubAccountId,
      required String name}) async {
    final res =
        await promiseToFuture(serviceApi!.createCanister(CreateCanisterRequest(
      amount: amount.asE8s().toJS,
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
            (canisterId != null) ? hiveBoxes.canisters[canisterId] : null);
  }

  @override
  Future<void> getCanisters() async {
    final res = await promiseToFuture(serviceApi!.getCanisters());

    final response = [...res];
    final canisterIds = response.mapToList((e) {
      final id = e.canisterId.toString();
      hiveBoxes.canisters[id] = Canister(name: e.name, publicKey: id, userIsController: null);
      return id;
    });

    final canistersToRemove = hiveBoxes.canisters.values
        .where((element) => !canisterIds.contains(element.identifier));
    canistersToRemove.forEach((element) {
      hiveBoxes.canisters.remove(element.identifier);
    });
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<BigInt> getICPToCyclesExchangeRate() async {
    final response =
        await promiseToFuture(serviceApi!.getIcpToCyclesConversionRate());
    final string = convertBigIntToString(response);
    return BigInt.parse(string);
  }

  @override
  Future<void> topupCanister(
      {required ICP amount,
      int? fromSubAccountId,
      required String targetCanisterId}) async {
    await promiseToFuture(serviceApi!.topupCanister(TopupCanisterRequest(
        amount: amount.asE8s().toJS,
        fromSubAccountId: fromSubAccountId,
        targetCanisterId: targetCanisterId)));
    await getCanister(targetCanisterId);
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> getCanister(String canisterId) async {
    final res = await promiseToFuture(
        serviceApi!.getCanisterDetails(canisterId));
    final response = jsonDecode(stringify(res));
    final canister = hiveBoxes.canisters[canisterId]!;
    canister.userIsController = response['kind'] == "success";
    if (canister.userIsController == true) {
      final details = response['details'];
      canister.cyclesBalance = details['cycles'].toString();
      final setting = details['setting'];
      canister.controller = setting['controller'].toString();
    }
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> changeCanisterController(
      String canisterId, String newController) async {
    final settings = UpdateSettingsRequest(
        canisterId: canisterId,
        settings:
            UpdateCanisterSettings(controller: newController));
    await promiseToFuture(serviceApi!.updateCanisterSettings(settings));
    await getCanister(canisterId);
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> renameSubAccount(
      {required String accountIdentifier, required String newName}) async {
    await promiseToFuture(serviceApi!.renameSubAccount(RenameSubAccountRequest(
      newName: newName,
      accountIdentifier: accountIdentifier,
    )));
    await accountsSyncService!.performSync();
  }

  @override
  Future<void> refreshNeurons() async {
    neuronSyncService?.fetchNeurons();
  }

  @override
  Future<void> refreshCanisters() async {
    getCanisters();
  }

  @override
  Future<void> detachCanister(String canisterId) async {
    await promiseToFuture(serviceApi!.detachCanister(
        DetachCanisterRequest(canisterId: canisterId)));
    await getCanisters();
  }

  @override
  Future<void> refreshAccount(Account account) async {
    transactionSyncService!.syncAccount(account);
    final res = await balanceSyncService!.fetchBalances([account.accountIdentifier]);
    account = hiveBoxes.accounts[account.accountIdentifier]!;
    account.balance = res[account.accountIdentifier]!;
    hiveBoxes.accounts.notifyChange();
  }

  @override
  String getPrincipal() {
    return authApi.getPrincipal();
  }

  @override
  Future<void> logout() async {
      await promiseToFuture(authApi.logout());
  }

  @override
  int getTimeUntilSessionExpiryMs() {
    return authApi.getTimeUntilSessionExpiryMs();
  }
}
