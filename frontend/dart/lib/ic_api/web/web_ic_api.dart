@JS()
library ic_agent.js;

import 'package:js/js.dart';
import 'dart:convert';
import 'package:nns_dapp/data/cycles.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/proposal_reward_status.dart';
import 'package:nns_dapp/data/topic.dart';
import 'package:nns_dapp/ic_api/web/suggested_followees_cache.dart';
import 'package:nns_dapp/ui/neurons/following/followee_suggestions.dart';
import 'package:oxidized/oxidized.dart';
import 'package:universal_html/html.dart' as html;
import 'package:universal_html/js.dart';
import 'package:universal_html/js_util.dart';
import 'js_utils.dart';
import 'hardware_wallet_api.dart' as hardwareWalletApi;
import '../../nns_dapp.dart';
import '../platform_ic_api.dart';
import 'account_sync_service.dart';
import 'auth_api.dart';
import 'neuron_sync_service.dart';
import 'proposal_sync_service.dart';
import 'service_api.dart';
import 'stringify.dart';

class PlatformICApi extends AbstractPlatformICApi {
  late AuthApi authApi;
  ServiceApi? serviceApi;
  AccountsSyncService? accountsSyncService;
  NeuronSyncService? neuronSyncService;
  ProposalSyncService? proposalSyncService;
  SuggestedFolloweesCache? suggestedFolloweesCache;

  dynamic identity;

  bool isLoggedIn() => authApi.tryGetIdentity() != null;

  PlatformICApi(HiveBoxesWidget hiveBoxes) : super(hiveBoxes);

  Future initialize() async {
    authApi = await promiseToFuture(createAuthApi(allowInterop(() {
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

    neuronSyncService =
        NeuronSyncService(serviceApi: serviceApi!, hiveBoxes: hiveBoxes);

    proposalSyncService =
        ProposalSyncService(serviceApi: serviceApi!, hiveBoxes: hiveBoxes);

    suggestedFolloweesCache =
        SuggestedFolloweesCache(func: this._followeeSuggestions);

    await Future.wait([
      neuronSyncService!.sync(),
      AccountsSyncService.initialize(serviceApi!, hiveBoxes)
          .then((service) async {
        accountsSyncService = service;
        await Future.wait([
          accountsSyncService!.syncBalances(),
          accountsSyncService!.syncTransactions()
        ]);
      }),
      getCanisters()
    ]);
  }

  @override
  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms}) async {
    await serviceApi!.acquireICPTs(accountIdentifier, doms).toFuture();
    await accountsSyncService!.syncBalances();
  }

  @override
  Future<void> makeDummyProposals({required BigInt neuronId}) async {
    await serviceApi!.makeDummyProposals(neuronId.toJS).toFuture();
  }

  @override
  Future<void> createSubAccount({required String name}) async {
    await promiseToFuture(serviceApi!.createSubAccount(name));
    // TODO(NNS1-826): verify that account is created successfully.
    await accountsSyncService!.syncAll();
  }

  @override
  Future<Result<Unit, Exception>> sendICP(
      {required String fromAccount,
      required String toAccount,
      required ICP amount,
      int? fromSubAccount}) async {
    try {
      final identity =
          (await this.getIdentityByAccountId(fromAccount)).unwrap();

      await promiseToFuture(serviceApi!.sendICP(
          identity,
          SendICPRequest(
              to: toAccount,
              amount: amount.asE8s().toJS,
              fromSubAccountId: fromSubAccount)));

      await Future.wait([
        accountsSyncService!.syncBalances(),
        accountsSyncService!.syncTransactions(),
        // Sync neurons in case we sent funds to them.
        neuronSyncService!.sync()
      ]);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<NeuronId, Exception>> stakeNeuron(
      Account account, ICP stakeAmount) async {
    try {
      final amountJS = stakeAmount.asE8s().toJS;
      final String neuronId = await () async {
        if (account.hardwareWallet) {
          final ledgerIdentity =
              (await this.connectToHardwareWallet()).unwrap();

          final accountIdentifier =
              getAccountIdentifier(ledgerIdentity)!.toString();

          if (accountIdentifier != account.accountIdentifier) {
            throw Exception(
                "Wallet account identifier doesn't match.\nExpected identifier: ${account.accountIdentifier}.\nWallet identifier: $accountIdentifier.\nAre you sure you connected the right wallet?");
          }

          final walletApi = await this.createHardwareWalletApi(ledgerIdentity);

          return await promiseToFuture(walletApi.createNeuron(amountJS));
        } else {
          return await promiseToFuture(serviceApi!.createNeuron(
              CreateNeuronRequest(
                  stake: amountJS, fromSubAccountId: account.subAccountId)));
        }
      }();

      await Future.wait(
          [accountsSyncService!.syncBalances(), neuronSyncService!.sync()]);

      return Result.ok(NeuronId.fromString(neuronId));
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> startDissolving(
      {required Neuron neuron}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();
      final res = await promiseToFuture(serviceApi!.startDissolving(
          identity, NeuronIdentifierRequest(neuronId: neuron.id.toString())));
      validateGovernanceResponse(res);
      await neuronSyncService!.sync();
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> stopDissolving(
      {required Neuron neuron}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();
      final res = await promiseToFuture(serviceApi!.stopDissolving(
          identity, NeuronIdentifierRequest(neuronId: neuron.id.toString())));
      validateGovernanceResponse(res);
      await neuronSyncService!.sync();
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> disburse(
      {required Neuron neuron,
      required ICP amount,
      String? toAccountId}) async {
    try {
      final identity = (await getIdentityByNeuron(neuron)).unwrap();

      await promiseToFuture(serviceApi!.disburse(
          identity,
          DisburseNeuronRequest(
              neuronId: neuron.id, amount: null, toAccountId: toAccountId)));

      neuronSyncService!.removeNeuron(neuron.id);
      await Future.wait(
          [accountsSyncService!.syncBalances(), neuronSyncService!.sync()]);

      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> merge(
      {required Neuron neuron1, required Neuron neuron2}) async {
    try {
      final identity1 = (await getIdentityByNeuron(neuron1)).unwrap();
      final identity2 = (await getIdentityByNeuron(neuron2)).unwrap();

      if (identity1.getPrincipal().toString() != identity2.getPrincipal().toString()) {
        return Result.err(Exception("The neurons being merged must both have the same controller"));
      }

      // TODO remove this check once hardware wallets are supported
      final currentUserPrincipal = this.getPrincipal();
      if (neuron1.controller != currentUserPrincipal || neuron2.controller != currentUserPrincipal) {
        return Result.err(Exception("Unable to merge neurons. Merging of neurons controlled via hardware wallet is not yet supported"));
      }

      // To ensure any built up age bonus is always preserved, if one neuron is
      // locked and the other is not, then we merge the neuron which is not
      // locked into the locked neuron.
      // In all other cases we merge the smaller neuron into the
      // larger one.

      final neuron1Locked = neuron1.state == NeuronState.LOCKED;
      final neuron2Locked = neuron2.state == NeuronState.LOCKED;

      Neuron targetNeuron;
      Neuron sourceNeuron;
      if (neuron1Locked != neuron2Locked) {
        if (neuron1Locked) {
          targetNeuron = neuron1;
          sourceNeuron = neuron2;
        } else {
          targetNeuron = neuron2;
          sourceNeuron = neuron1;
        }
      } else {
        if (neuron1.cachedNeuronStake.asE8s() >= neuron2.cachedNeuronStake.asE8s()) {
          targetNeuron = neuron1;
          sourceNeuron = neuron2;
        } else {
          targetNeuron = neuron2;
          sourceNeuron = neuron1;
        }
      }

      await promiseToFuture(serviceApi!.merge(
          identity1,
          MergeRequest(
              neuronId: targetNeuron.id.toBigInt.toJS,
              sourceNeuronId: sourceNeuron.id.toBigInt.toJS)));
      await fetchNeuron(neuronId: targetNeuron.id.toBigInt);
      neuronSyncService!.removeNeuron(sourceNeuron.id.toString());
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> mergeMaturity(
      {required Neuron neuron, required int percentageToMerge}) async {
    try {
      final identity = (await getIdentityByNeuron(neuron)).unwrap();

      await promiseToFuture(serviceApi!.mergeMaturity(
          identity,
          MergeMaturityRequest(
              neuronId: neuron.id.toBigInt.toJS,
              percentageToMerge: percentageToMerge)));
      await fetchNeuron(neuronId: neuron.id.toBigInt);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) async {
    await promiseToFuture(serviceApi!.follow(FollowRequest(
        neuronId: toJSBigInt(neuronId.toString()),
        topic: topic.index,
        followees: followees.mapToList((e) => e.toJS))));

    await neuronSyncService!.sync();
  }

  @override
  Future<Result<Unit, Exception>> increaseDissolveDelay(
      {required Neuron neuron,
      required int additionalDissolveDelaySeconds}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();

      final res = await promiseToFuture(serviceApi!.increaseDissolveDelay(
          identity,
          IncreaseDissolveDelayRequest(
            neuronId: neuron.id.toString(),
            additionalDissolveDelaySeconds: additionalDissolveDelaySeconds,
          )));
      validateGovernanceResponse(res);
      await fetchNeuron(neuronId: neuron.id.toBigInt);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> joinCommunityFund(
      {required Neuron neuron}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();

      final res = await promiseToFuture(serviceApi!.joinCommunityFund(
          identity,
          JoinCommunityFundRequest(
            neuronId: toJSBigInt(neuron.id.toString()),
          )));

      validateGovernanceResponse(res);
      await fetchNeuron(neuronId: neuron.id.toBigInt);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) async {
    await Future.wait(neuronIds.map(
        (e) => promiseToFuture(serviceApi!.registerVote(RegisterVoteRequest(
              neuronId: e.toJS,
              proposal: proposalId.toJS,
              vote: vote.index,
            )))));
    await neuronSyncService!.sync();
  }

  @override
  Future<Result<Unit, Exception>> addHotkey(
      {required BigInt neuronId, required String principal}) async {
    try {
      final res = await promiseToFuture(serviceApi!.addHotKey(
          AddHotkeyRequest(neuronId: neuronId.toJS, principal: principal)));
      validateGovernanceResponse(res);
      await fetchNeuron(neuronId: neuronId);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> addHotkeyForHW(
      {required BigInt neuronId, required String principal}) async {
    try {
      final identity = (await this.connectToHardwareWallet()).unwrap();
      final hwApi = await this.createHardwareWalletApi(identity);

      final res = await promiseToFuture(
          hwApi.addHotKey(neuronId.toString(), principal));
      validateGovernanceResponse(res);
      await neuronSyncService!.sync();
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<Result<Unit, Exception>> removeHotkey(
      {required Neuron neuron, required String principal}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();

      final request = RemoveHotkeyRequest(
          neuronId: neuron.id.toString(), principal: principal);
      final res =
          await promiseToFuture(serviceApi!.removeHotKey(identity, request));
      validateGovernanceResponse(res);
      await fetchNeuron(neuronId: neuron.id.toBigInt);
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
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
  Future<Neuron?> fetchNeuron({required BigInt neuronId}) async {
    // Fetch the neuron's info in a certified way.
    final res =
        await promiseToFuture(serviceApi!.getNeuron(neuronId.toJS, true));
    if (res == null) {
      neuronSyncService!.removeNeuron(neuronId.toString());
      return null;
    } else {
      final neuronInfo = jsonDecode(stringify(res));
      return neuronSyncService!.storeNeuron(neuronInfo);
    }
  }

  @override
  Future<Result<List<NeuronInfoForHW>, Exception>> fetchNeuronsForHW(
      Account account) async {
    try {
      final identity = (await this.connectToHardwareWallet()).unwrap();

      // Verify the identity matches the account.
      if (identity.getPrincipal().toString() != account.principal) {
        return Result.err(Exception(
            "The hardware wallet's principal doesn't match the account's principal. Are you sure you connected the right wallet?\nAccount's principal: ${account.principal}\nHardware wallet's principal: ${identity.getPrincipal()}"));
      }

      final res = await promiseToFuture(serviceApi!.getNeuronsForHw(identity));
      final string = stringify(res);
      final response = (jsonDecode(string) as List<dynamic>)
          .map((e) => NeuronInfoForHW(
              id: NeuronId.fromString(e['id']),
              amount: ICP.fromE8s((e['amount'] as String).toBigInt),
              hotkeys: (e['hotKeys'] as List<dynamic>)
                  .map((x) => x.toString())
                  .toList()))
          .toList();
      return Result.ok(response);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId}) async {
    // Fetch the neuron's info in a certified way.
    final res =
        await promiseToFuture(serviceApi!.getNeuron(neuronId.toJS, true));
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
  Future<Proposal> getFullProposalInfo({required Proposal proposal}) async {
      return await proposalSyncService!.getFullProposal(proposal.id.toBigInt);
  }

  @override
  Future<Result<dynamic, Exception>> connectToHardwareWallet() async {
    try {
      return Result.ok(
          await promiseToFuture(authApi.connectToHardwareWallet()));
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<hardwareWalletApi.HardwareWalletApi> createHardwareWalletApi(
      dynamic ledgerIdentity) async {
    return await promiseToFuture(
        hardwareWalletApi.createHardwareWalletApi(ledgerIdentity));
  }

  @override
  Future<void> test() async {
    await promiseToFuture(serviceApi!.integrationTest());
  }

  @override
  Future<void> registerHardwareWallet(
      {required String name, required dynamic ledgerIdentity}) async {
    await promiseToFuture(
        serviceApi!.registerHardwareWallet(name, ledgerIdentity));
  }

  @override
  Future<void> refreshAccounts({bool waitForFullSync = false}) async {
    await accountsSyncService!.syncAll(waitForFullSync: waitForFullSync);
  }

  @override
  Future<Neuron> spawnNeuron({required Neuron neuron, required int? percentageToSpawn}) async {
    final identity = (await this.getIdentityByNeuron(neuron)).unwrap();
    final spawnResponse = await promiseToFuture(serviceApi!.spawn(identity,
        SpawnRequest(neuronId: neuron.id.toString(), percentageToSpawn: percentageToSpawn, newController: null)));
    dynamic response = jsonDecode(stringify(spawnResponse));
    final createdNeuronId = response['createdNeuronId'].toString();
    await neuronSyncService!.sync();
    return hiveBoxes.neurons.values.firstWhere((element) => element.identifier == createdNeuronId);
  }

  @override
  Future<Result<Unit, Exception>> splitNeuron(
      {required Neuron neuron, required ICP amount}) async {
    try {
      final identity = (await this.getIdentityByNeuron(neuron)).unwrap();

      await promiseToFuture(serviceApi!.split(
          identity,
          SplitNeuronRequest(
            neuronId: toJSBigInt(neuron.id.toString()),
            amount: amount.asE8s().toJS,
          )));
      await refreshNeurons();
      return Result.ok(unit);
    } catch (err) {
      return Result.err(Exception(err));
    }
  }

  @override
  Future<AttachCanisterResult> attachCanister(
      {required String name, required String canisterId}) async {
    final response = await promiseToFuture(serviceApi!.attachCanister(
        AttachCanisterRequest(name: name, canisterId: canisterId)));
    return AttachCanisterResult.values[response.toInt()];
  }

  @override
  Future<CreateCanisterResponse> createCanister(
      {required ICP amount, int? fromSubAccountId}) async {
    final res =
        await promiseToFuture(serviceApi!.createCanister(CreateCanisterRequest(
      amount: amount.asE8s().toJS,
      fromSubAccountId: fromSubAccountId,
    )));

    await getCanisters();

    final response = jsonDecode(stringify(res));

    final String? canisterId = response['created'];
    final Canister? canister =
        (canisterId != null) ? hiveBoxes.canisters[canisterId] : null;
    final error = response['error'];
    final String? errorMessage = error != null ? error['message'] : null;
    final bool refunded = error != null && error['refunded'];

    return CreateCanisterResponse(
        canisterId: canisterId,
        errorMessage: errorMessage,
        canister: canister,
        refunded: refunded);
  }

  @override
  Future<void> getCanisters() async {
    Future<void> _getCanisters(bool useUpdateCalls) async {
      final res =
          await promiseToFuture(serviceApi!.getCanisters(useUpdateCalls));

      final response = [...res];
      final canisterIds = response.mapToList((e) {
        final id = e.canisterId.toString();
        hiveBoxes.canisters[id] =
            Canister(name: e.name, publicKey: id, userIsController: null);
        return id;
      });

      final canistersToRemove = hiveBoxes.canisters.values
          .where((element) => !canisterIds.contains(element.identifier));
      canistersToRemove.forEach((element) {
        hiveBoxes.canisters.remove(element.identifier);
      });
      // ignore: deprecated_member_use
      hiveBoxes.canisters.notifyChange();
    }

    print("[${DateTime.now()}] Syncing canisters with a query call...");
    await _getCanisters(false);

    print("[${DateTime.now()}] Syncing canisters with an update call...");
    _getCanisters(true).then(
        (_) => {print("[${DateTime.now()}] Syncing canisters complete.")});
  }

  Future<List<FolloweeSuggestion>> followeeSuggestions() {
    return this.suggestedFolloweesCache!.get();
  }

  Future<List<FolloweeSuggestion>> _followeeSuggestions(
      [bool certified = true]) async {
    final res =
        await promiseToFuture(serviceApi!.followeeSuggestions(certified));
    final response = jsonDecode(stringify(res)) as List<dynamic>;
    return response
        .map((e) => FolloweeSuggestion(e["name"], e["description"], e["id"]))
        .toList();
  }

  @override
  Future<BigInt> getICPToCyclesExchangeRate() async {
    final response =
        await promiseToFuture(serviceApi!.getIcpToCyclesConversionRate());
    final string = convertBigIntToString(response);
    return BigInt.parse(string);
  }

  @override
  Future<void> topUpCanister(
      {required ICP amount,
      int? fromSubAccountId,
      required String canisterId}) async {
    await promiseToFuture(serviceApi!.topUpCanister(TopUpCanisterRequest(
        amount: amount.asE8s().toJS,
        fromSubAccountId: fromSubAccountId,
        canisterId: canisterId)));
    await getCanister(canisterId);
    // ignore: deprecated_member_use
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> getCanister(String canisterId) async {
    final res =
        await promiseToFuture(serviceApi!.getCanisterDetails(canisterId));
    final response = jsonDecode(stringify(res));
    final canister = hiveBoxes.canisters[canisterId]!;
    canister.userIsController = response['kind'] == "success";
    if (canister.userIsController == true) {
      final details = response['details'];
      canister.cyclesBalance =
          Cycles.fromBigInt(BigInt.parse(details['cycles'].toString()));
      final setting = details['setting'];
      canister.controllers = List.castFrom(setting['controllers']);
    }
    // ignore: deprecated_member_use
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> changeCanisterControllers(
      String canisterId, List<String> newControllers) async {
    final settings = UpdateSettingsRequest(
        canisterId: canisterId,
        settings: UpdateCanisterSettings(controllers: newControllers));
    await promiseToFuture(serviceApi!.updateCanisterSettings(settings));
    await getCanister(canisterId);
    // ignore: deprecated_member_use
    hiveBoxes.canisters.notifyChange();
  }

  @override
  Future<void> renameSubAccount(
      {required String accountIdentifier, required String newName}) async {
    await promiseToFuture(serviceApi!.renameSubAccount(RenameSubAccountRequest(
      newName: newName,
      accountIdentifier: accountIdentifier,
    )));
    await accountsSyncService!.syncAll();
  }

  @override
  Future<void> refreshNeurons() async {
    neuronSyncService?.sync();
  }

  @override
  Future<void> refreshCanisters() async {
    getCanisters();
  }

  @override
  Future<void> detachCanister(String canisterId) async {
    await promiseToFuture(serviceApi!
        .detachCanister(DetachCanisterRequest(canisterId: canisterId)));
    await getCanisters();
  }

  @override
  Future<void> refreshAccount(Account account) async {
    await accountsSyncService!.syncAll(accounts: [account]);
  }

  @override
  String getPrincipal() {
    final principal = authApi.getPrincipal();
    if (principal != null) {
      return principal;
    } else {
      // We're not logged in. Redirect to the login page.
      this.logout();
      return "null";
    }
  }

  @override
  Future<void> logout() async {
    await promiseToFuture(authApi.logout());
    // Make certain that the local storage, including the delegation, are erased.
    html.window.localStorage.clear();
    // Go to the svelte login page.
    html.window.location.assign("/v2/");
  }

  @override
  int? getTimeUntilSessionExpiryMs() {
    return authApi.getTimeUntilSessionExpiryMs();
  }

  /*
   * Returns the principal's main account, if available.
   */
  @override
  Account? getAccountByPrincipal(String principal) {
    return hiveBoxes.accounts.values.firstWhere(
        (account) =>
            account.principal == principal &&
            (account.subAccountId == null || account.subAccountId == 0),
        orElse: () => null);
  }

  /*
   * Returns true if the neuron can be controlled. A neuron can be controlled if:
   *
   *  1. The user is the controller
   *  OR
   *  2. The user's hardware wallet is the controller.
   */
  @override
  bool isNeuronControllable(Neuron neuron) {
    return this.getAccountByPrincipal(neuron.controller) != null;
  }

  /// Returns the identity associated with the neuron's controller.
  Future<Result<dynamic, Exception>> getIdentityByNeuron(Neuron neuron) async {
    final controllerAccount = this.getAccountByPrincipal(neuron.controller);
    if (controllerAccount == null) {
      return Result.err(Exception(
          "Neuron $neuron.id is not controlled by you.\nIf this neuron is controlled by a hardware wallet, first add the hardware wallet to your account."));
    }

    assert(neuron.controller == controllerAccount.principal);

    if (controllerAccount.principal == this.getPrincipal()) {
      // The neuron is controlled by the user's II. Use that.
      return Result.ok(this.identity);
    }

    // Assume the user is using a HW wallet. Request it.
    return (await this.connectToHardwareWallet()).when(
        ok: (hwIdentity) {
          // Verify that the hardware wallet being used is the correct one.
          if (hwIdentity.getPrincipal().toString() != neuron.controller) {
            return Result.err(Exception(
                "Principal of the hardware wallet doesn't match the neuron's controller. Are you sure you connected the right wallet?\nNeuron's controller: ${neuron.controller}\nHardware wallet's principal: ${hwIdentity.getPrincipal()}"));
          }
          return Result.ok(hwIdentity);
        },
        err: (err) => Result.err(Exception(err)));
  }

  /// Returns the identity of an account identifier.
  ///
  /// NOTE: This method currently supports account IDs of accounts, not neurons.
  Future<Result<dynamic, Exception>> getIdentityByAccountId(
      String accountId) async {
    if (!hiveBoxes.accounts.containsKey(accountId)) {
      return Result.err(Exception("Unkown account id: $accountId"));
    }

    final account = hiveBoxes.accounts[accountId];
    if (!account.hardwareWallet) {
      // Not a hardware wallet. Return the user's II.
      return Result.ok(this.identity);
    }

    // Hardware wallet. Get its identity.
    final hwConnectionRes = await this.connectToHardwareWallet();

    return hwConnectionRes.when(
        ok: (ledgerIdentity) {
          final hwAccountIdentifier =
              getAccountIdentifier(ledgerIdentity)!.toString();

          if (hwAccountIdentifier != accountId) {
            return Result.err(Exception(
                "Wallet account identifier doesn't match.\n\nExpected identifier: $accountId.\nWallet identifier: $hwAccountIdentifier.\n\nAre you sure you connected the right wallet?"));
          }

          return Result.ok(ledgerIdentity);
        },
        err: (err) => Result.err(Exception(err)));
  }

  Future<void> showPrincipalAndAddressOnDevice(Account account) async {
    final identity = (await this.connectToHardwareWallet()).unwrap();

    if (identity.getPrincipal().toString() != account.principal) {
      throw "The hardware wallet's principal doesn't match the account's principal. Are you sure you connected the right wallet?\nAccount's principal: ${account.principal}\nHardware wallet's principal: ${identity.getPrincipal()}";
    }

    await identity.showAddressAndPubKeyOnDevice();
  }

  @override
  String principalToAccountIdentifier(String principal) {
    return serviceApi!.principalToAccountIdentifier(principal);
  }
}

void validateGovernanceResponse(dynamic res) {
  final json = jsonDecode(stringify(res));
  if (json['Err'] != null) {
    throw GovernanceError(
        json["Err"]["errorType"], json["Err"]["errorMessage"]);
  }
}

enum GovernanceErrorType {
  UNSPECIFIED,
  OK,
  UNAVAILABLE,
  NOT_AUTHORIZED,
  NOT_FOUND,
  INVALID_COMMAND,
  REQUIRES_NOT_DISSOLVING,
  REQUIRES_DISSOLVING,
  REQUIRES_DISSOLVED,
  HOT_KEY,
  RESOURCE_EXHAUSTED,
  PRECONDITION_FAILED,
  EXTERNAL,
  LEDGER_UPDATE_ONGOING,
  INSUFFICIENT_FUNDS,
  INVALID_PRINCIPAL,
  INVALID_PROPOSAL,
}

class GovernanceError {
  final int type;
  final String message;

  GovernanceError(this.type, this.message);

  @override
  String toString() {
    // Convert the error type into its corresponding string. If the error type
    // is unknown, we display the number as-is.
    final errorTypeString = (this.type < GovernanceErrorType.values.length)
        ? GovernanceErrorType.values[this.type].toString()
        : this.type.toString();
    return "GovernanceError:\nError Type: $errorTypeString\nError Message: ${this.message}";
  }
}
