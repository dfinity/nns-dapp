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
import 'stringify.dart';

class PlatformICApi extends AbstractPlatformICApi {
  final authApi = new AuthApi();
  LedgerApi? ledgerApi;
  GovernanceApi? governanceApi;
  AccountsSyncService? accountsSyncService;
  BalanceSyncService? balanceSyncService;
  TransactionSyncService? transactionSyncService;
  NeuronSyncService? neuronSyncService;
  ProposalSyncService? proposalSyncService;

  PlatformICApi(HiveBoxesWidget hiveBoxes) : super(hiveBoxes);

  @override
  void authenticate(BuildContext context) async {
    await hiveBoxes.authToken.clear();

    final key = authApi.createKey();
    await context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    print("Stored token ${context.boxes.authToken.get(WEB_TOKEN_KEY)?.key}");
    authApi.loginWithIdentityProvider(
        key, "http://" + window.location.host + "/home");
  }

  Future<void> buildServices() async {
    final token = hiveBoxes.authToken.webAuthToken;
    if (token != null && token.data != null && ledgerApi == null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      //const gatewayHost = "http://localhost:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      ledgerApi = new LedgerApi(gatewayHost, identity);
      governanceApi = new GovernanceApi(gatewayHost, identity);

      // @Gilbert perhaps this could be triggered from a button?
      // Also this is being hit twice for some reason
      await promiseToFuture(ledgerApi!.integrationTest());

      accountsSyncService = AccountsSyncService(ledgerApi!, hiveBoxes);
      balanceSyncService = BalanceSyncService(ledgerApi!, hiveBoxes);
      transactionSyncService =
          TransactionSyncService(ledgerApi: ledgerApi!, hiveBoxes: hiveBoxes);
      neuronSyncService = NeuronSyncService(
          governanceApi: governanceApi!, hiveBoxes: hiveBoxes);
      proposalSyncService = ProposalSyncService(
          governanceApi: governanceApi!, hiveBoxes: hiveBoxes);
      print("syncing accounts");

      await accountsSyncService!.performSync();
      balanceSyncService!.syncBalances();
      transactionSyncService!.syncAccount(hiveBoxes.accounts.primary);
      neuronSyncService!.fetchNeurons();
    }
  }

  @override
  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms}) async {
    await ledgerApi!.acquireICPTs(accountIdentifier, doms).toFuture();
    await balanceSyncService!.syncBalances();
  }

  @override
  Future<void> createSubAccount({required String name}) async {
    promiseToFuture(ledgerApi!.createSubAccount(name)).then((value) {
      final json = jsonDecode(ledgerApi!.jsonString(value));
      final res = json['Ok'];
      accountsSyncService!.storeSubAccount(res);
    });
  }

  @override
  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt doms,
      int? fromSubAccount}) async {
    await promiseToFuture(ledgerApi!.sendICPTs(jsify({
      'to': toAccount,
      'amount': doms,
      if (fromSubAccount != null) 'fromSubAccountId': fromSubAccount.toInt()
    })));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.accounts.primary)
    ]);
  }

  @override
  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      required BigInt dissolveDelayInSecs,
      int? fromSubAccount}) async {
    final request = {
      'stake': stakeInDoms,
      'dissolveDelayInSecs': dissolveDelayInSecs,
      if (fromSubAccount != null) 'fromSubAccountId': fromSubAccount.toInt()
    };
    print("create neuron request ${request}");
    await promiseToFuture(ledgerApi!.createNeuron(jsify(request)));
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
        {'neuronId': neuronId, 'amount': doms, 'toAccountId': toSubaccountId});
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> disburseToNeuron(
      {required BigInt neuronId,
      required BigInt dissolveDelaySeconds,
      required BigInt doms}) async {
    await callApi(governanceApi!.disburseToNeuron, {
      'neuronId': neuronId,
      'amount': doms,
      'dissolveDelaySeconds': dissolveDelaySeconds
    });
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) async {
    final result = await callApi(governanceApi!.follow,
        {'neuronId': neuronId, 'topic': topic.index, 'followees': followees});
    print("follow ${stringify(result)}");

    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required BigInt additionalDissolveDelaySeconds}) async {
    final result = await callApi(governanceApi!.increaseDissolveDelay, {
      'neuronId': neuronId,
      'additionalDissolveDelaySeconds': additionalDissolveDelaySeconds,
    });
    print("increaseDissolveDelay ${stringify(result)}");

    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> makeMotionProposal(
      {required BigInt neuronId,
      required String url,
      required String text,
      required String summary}) async {
    final result = await callApi(governanceApi!.makeMotionProposal, {
      'neuronId': neuronId,
      'url': url,
      'text': text,
      'summary': summary,
    });
    print("makeMotionProposal ${stringify(result)}");
  }

  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) async {
    final result = await Future.wait(
        neuronIds.map((e) => callApi(governanceApi!.registerVote, {
              'neuronId': e,
              'proposal': proposalId,
              'vote': vote.index,
            })));
    print("registerVote ${stringify(result)}");
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
  Future<Neuron> getNeuron({required BigInt neuronId}) async {
    final res = await promiseToFuture(governanceApi!.getNeuron(neuronId));
    final neuronInfo = jsonDecode(governanceApi!.jsonString(res));
    final neuron = Neuron.empty();
    neuronSyncService!.updateNeuron(neuron, neuronId.toString(), neuronInfo);
    return neuron;
  }
}
