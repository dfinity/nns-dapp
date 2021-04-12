@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ic_api/web/proposal_sync_service.dart';
import 'package:dfinity_wallet/ic_api/web/transaction_sync_service.dart';
import 'package:hive/hive.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../../dfinity.dart';
import 'account_sync_service.dart';
import 'auth_api.dart';
import 'balance_sync_service.dart';
import 'governance_api.dart';
import 'js_utils.dart';
import 'ledger_api.dart';
import 'neuron_sync_service.dart';
import 'package:dfinity_wallet/dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi {
  final authApi = new AuthApi();
  late HiveBoxesWidget hiveBoxes;
  LedgerApi? ledgerApi;
  GovernanceApi? governanceApi;
  AccountsSyncService? accountsSyncService;
  BalanceSyncService? balanceSyncService;
  TransactionSyncService? transactionSyncService;
  NeuronSyncService? neuronSyncService;
  ProposalSyncService? proposalSyncService;

  @override
  void authenticate(BuildContext context) async {
    await context.boxes.authToken.clear();

    final key = authApi.createKey();
    await context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    print("Stored token ${context.boxes.authToken.get(WEB_TOKEN_KEY)?.key}");
    authApi.loginWithIdentityProvider(
        key, "http://" + window.location.host + "/home");
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    hiveBoxes = context.boxes;
    buildServices(context);
  }

  Future<void> buildServices(BuildContext context) async {
    final token = hiveBoxes.authToken.webAuthToken;
    if (token != null && token.data != null && ledgerApi == null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      //const gatewayHost = "http://localhost:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      ledgerApi = new LedgerApi(gatewayHost, identity);
      governanceApi = new GovernanceApi(gatewayHost, identity);

      // @Gilbert perhaps this could be triggered from a button?
      // Also this is being hit twice for some reason
//      await promiseToFuture(ledgerApi!.integrationTest());

      accountsSyncService = AccountsSyncService(ledgerApi!, hiveBoxes);
      balanceSyncService = BalanceSyncService(ledgerApi!, hiveBoxes);
      transactionSyncService =
          TransactionSyncService(ledgerApi: ledgerApi!, hiveBoxes: hiveBoxes);
      neuronSyncService = NeuronSyncService(
          governanceApi: governanceApi!, hiveBoxes: hiveBoxes);
      proposalSyncService = ProposalSyncService(
          governanceApi: governanceApi!, hiveBoxes: hiveBoxes);

      await accountsSyncService!.performSync();
      balanceSyncService!.syncBalances();
      transactionSyncService!.syncAccount(hiveBoxes.wallets.primary);
      neuronSyncService!.fetchNeurons();
      proposalSyncService!.fetchProposals();
    }
  }

  @override
  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms}) async {
    await ledgerApi!
        .acquireICPTs(accountIdentifier, doms)
        .toFuture();
    await balanceSyncService!.syncBalances();
  }

  @override
  Future<void> createSubAccount({required String name}) async {
    final response = await promiseToFuture(ledgerApi!.createSubAccount(name));
    await accountsSyncService!.performSync();
  }

  @override
  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt doms,
        int? fromSubAccount}) async {
    await promiseToFuture(ledgerApi!.sendICPTs(jsify({
      'to': toAccount,
      'amount': doms,
      if (fromSubAccount != null)
        'fromSubAccountId': fromSubAccount.toInt()
    })));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.wallets.primary)
    ]);
  }

  @override
  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      required BigInt dissolveDelayInSecs,
        int? fromSubAccount}) async {
    await promiseToFuture(governanceApi!.createNeuron(jsify({
      'stake': stakeInDoms,
      'dissolveDelayInSecs': dissolveDelayInSecs,
      if (fromSubAccount != null)
        'fromSubAccountId': fromSubAccount.toInt()
    })));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> startDissolving({required BigInt neuronId}) async {
    await callApi(governanceApi!.startDissolving, ({'neuronId': neuronId}));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> stopDissolving({required BigInt neuronId}) async {
    await callApi(governanceApi!.stopDissolving, {'neuronId': neuronId});
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> disburse(
      {required BigInt neuronId,
      required BigInt doms,
      BigInt? toSubaccountId}) async {
    await callApi(governanceApi!.disburse,
        {'neuronId': neuronId, 'doms': doms, 'toSubaccountId': toSubaccountId});
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> disburseToNeuron(
      {required BigInt neuronId,
      required BigInt dissolveDelaySeconds,
      required BigInt doms}) async {
    await callApi(governanceApi!.disburseToNeuron, {
      'neuronId': neuronId,
      'doms': doms,
      'dissolveDelaySeconds': dissolveDelaySeconds
    });
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) async {
    await callApi(governanceApi!.follow,
        {'neuronId': neuronId, 'topic': topic.index, 'followees': followees});
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required BigInt additionalDissolveDelaySeconds}) async {
    await callApi(governanceApi!.increaseDissolveDelay, {
      'neuronId': neuronId,
      'additionalDissolveDelaySeconds': additionalDissolveDelaySeconds,
    });
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> makeMotionProposal(
      {required BigInt neuronId,
      required String url,
      required String text,
      required String summary}) async {
    await callApi(governanceApi!.makeMotionProposal, {
      'neuronId': neuronId,
      'url': url,
      'text': text,
      'summary': summary,
    });
  }

  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) async {
    await Future.wait(neuronIds.map((e) => callApi(governanceApi!.registerVote, {
      'neuronId': e,
      'proposal': proposalId,
      'vote': vote.index,
    })));

   await Future.wait(neuronIds.map((neuronId) async {
      final neuron = neuronSyncService!.hiveBoxes.neurons.get(neuronId.toString())!;

      neuron.recentBallots = [
        ...neuron.recentBallots,
        BallotInfo()
          ..vote = vote
          ..proposalId = proposalId.toString()
      ];
       await neuron.save();
    }));

    await neuronSyncService!.fetchNeurons();
  }
}
