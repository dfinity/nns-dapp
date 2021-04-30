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
        key, "http://" + window.location.host + "/index.html");
  }
  final gatewayHost = "http://10.12.31.5:8080/";

  Future<void> buildServices() async {
    final token = hiveBoxes.authToken.webAuthToken;
    if (token != null && token.data != null && ledgerApi == null) {

      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      print("token data ${token.data!}");
      ledgerApi = createLedgerApi(gatewayHost, identity);
      governanceApi = createGovernanceApi(gatewayHost, identity);

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
    await promiseToFuture(ledgerApi!.createSubAccount(name)).then((value) {
      final json = jsonDecode(stringify(value));
      final res = json['Ok'];
      accountsSyncService!.storeSubAccount(res);
    });
  }

  @override
  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt doms,
      int? fromSubAccount}) async {
    await promiseToFuture(ledgerApi!.sendICPTs(SendICPTsRequest(
      to: toAccount,
      amount: doms.toJS,
      fromSubAccountId: fromSubAccount
    )));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.accounts.primary)
    ]);
  }

  @override
  Future<void> createNeuron(
      {required BigInt stakeInDoms, int? fromSubAccount}) async {
    await promiseToFuture(ledgerApi!.createNeuron(CreateNeuronRequest(stake: stakeInDoms, fromSubAccountId: fromSubAccount)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> startDissolving({required BigInt neuronId}) async {
    await promiseToFuture(governanceApi!.startDissolving(NeuronIdentifierRequest(neuronId: neuronId.toJS)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> stopDissolving({required BigInt neuronId}) async {
    await promiseToFuture(governanceApi!.stopDissolving(NeuronIdentifierRequest(neuronId: neuronId.toJS)));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> disburse(
      {required BigInt neuronId,
      required BigInt doms,
      required String toAccountId}) async {
    await governanceApi!.disburse(DisperseNeuronRequest(neuronId: neuronId.toJS, amount: doms.toJS, toAccountId: toAccountId));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) async {
    final result = await promiseToFuture(governanceApi!.follow(FollowRequest(
      neuronId:  toJSBigInt(neuronId.toString()),
        topic: topic.index,
        followees: followees.mapToList((e) => e.toJS)
    )));
    print("follow ${stringify(result)}");

    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required int additionalDissolveDelaySeconds}) async {
    print("before increaseDissolveDelay");
    await promiseToFuture(governanceApi!.increaseDissolveDelay(IncreaseDissolveDelayRequest(
        neuronId: neuronId.toJS,
        additionalDissolveDelaySeconds: additionalDissolveDelaySeconds,
    )));
    print("before getNeuron");
    await fetchNeuron(neuronId: neuronId);
    print("after getNeuron");
  }


  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) async {
    final result = await Future.wait(
        neuronIds.map((e) => promiseToFuture(governanceApi!.registerVote(RegisterVoteRequest(
              neuronId: e.toJS,
              proposal: proposalId.toJS,
              vote: vote.index,
            )))));
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
  Future<Neuron> fetchNeuron({required BigInt neuronId}) async {
    final res = await promiseToFuture(governanceApi!.getNeuron(neuronId.toJS));
    final neuronInfo = jsonDecode(stringify(res));
    print("get neuron response ${stringify(res)}");
    return neuronSyncService!.storeNeuron(neuronInfo);
  }

  @override
  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId}) async {
    final res = await promiseToFuture(governanceApi!.getNeuron(neuronId.toJS));
    final neuronInfo = jsonDecode(stringify(res));
    print("Neuron info Response ${stringify(res)}");
    final nInfo = NeuronInfo.fromResponse(neuronInfo);
    print("nInfo ${nInfo}");
    return nInfo;
  }

  @override
  Future<void> createDummyProposals({required BigInt neuronId}) async {
    await promiseToFuture(ledgerApi!.createDummyProposals(neuronId.toString()));
    await fetchProposals(
        excludeTopics: [],
        includeStatus: ProposalStatus.values,
        includeRewardStatus: ProposalRewardStatus.values);
  }

  @override
  Future<Proposal> fetchProposal({required BigInt proposalId}) async{
    final response = await governanceApi!.getProposalInfo(proposalId.toJS);
    final json = jsonDecode(stringify(response));
    print("proposal json ${stringify(response)}");
    final proposal = await proposalSyncService!.storeProposal(json);
    proposalSyncService!.linkProposalsToNeurons();
    return Proposal.empty();
  }

  @override
  Future<dynamic> connectToHardwareWallet() {
    return promiseToFuture(authApi.connectToHardwareWallet());
  }

  @override
  Future<HardwareWalletApi> createHardwareWalletApi({dynamic ledgerIdentity}) async {
    final identity = await promiseToFuture(authApi.connectToHardwareWallet());
    print(identity);
    return HardwareWalletApi(gatewayHost, identity);
  }


  @override
  Future<void> test() async {
    await promiseToFuture(ledgerApi!.integrationTest());
  }
}


@JS()
@anonymous
class IncreaseDissolveDelayRequest {
  external dynamic get neuronId;
  external num get additionalDissolveDelaySeconds;

  external factory IncreaseDissolveDelayRequest({dynamic neuronId, num additionalDissolveDelaySeconds});
}

@JS()
@anonymous
class FollowRequest {
  external dynamic neuronId;
  external int topic;
  external List<dynamic> followees;

 external factory FollowRequest({dynamic neuronId, int topic, List<dynamic> followees});
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
class DisperseNeuronRequest {
  external dynamic neuronId;
  external dynamic amount;
  external String toAccountId;

  external factory DisperseNeuronRequest({dynamic neuronId, dynamic amount, String toAccountId});
}


@JS()
@anonymous
class SendICPTsRequest {
  external dynamic to;
  external dynamic amount;
  external int? fromSubAccountId;

  external factory SendICPTsRequest({dynamic to, dynamic amount, int? fromSubAccountId});
}



@JS()
@anonymous
class RegisterVoteRequest {
  external dynamic neuronId;
  external dynamic proposal;
  external int vote;

  external factory RegisterVoteRequest({dynamic neuronId, dynamic proposal, int vote});
}

