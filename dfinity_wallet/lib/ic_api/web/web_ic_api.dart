@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:hive/hive.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../../dfinity.dart';
import 'auth_api.dart';
import 'governance_api.dart';
import 'ledger_api.dart';
import 'promise.dart';
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
      transactionSyncService = TransactionSyncService(ledgerApi: ledgerApi!, hiveBoxes: hiveBoxes);
      neuronSyncService = NeuronSyncService(governanceApi: governanceApi!, hiveBoxes: hiveBoxes);
      proposalSyncService = ProposalSyncService(governanceApi: governanceApi!, hiveBoxes: hiveBoxes);

      await accountsSyncService!.performSync();
      balanceSyncService!.syncBalances();
      transactionSyncService!.syncAccount(hiveBoxes.wallets.primary);
      neuronSyncService!.fetchNeurons();
      proposalSyncService!.fetchProposals();
    }
  }

  @override
  Future<void> acquireICPTs(String accountIdentifier, BigInt doms) async {
    await ledgerApi!
        .acquireICPTs(accountIdentifier, jsify({'doms': doms}))
        .toFuture();
    await balanceSyncService!.syncBalances();
  }

  @override
  Future<void> createSubAccount(String name) async {
    final response = await promiseToFuture(ledgerApi!.createSubAccount(name));
    await accountsSyncService!.performSync();
    // final namedSubAccount = response.Ok;
    // final address = namedSubAccount.accountIdentifier;
    // final newWallet = Wallet(
    //     namedSubAccount.name,
    //     address.toString(),
    //     false,
    //     "0",
    //     namedSubAccount.subAccountId.map((e) => e.toInt()).toList().cast<int>(),
    //     []);
    // await hiveBoxes.wallets.put(address.toString(), newWallet);
  }

  @override
  Future<void> sendICPTs(
      String toAccount, double icpts, String? fromSubAccount) async {
    await promiseToFuture(ledgerApi!.sendICPTs(jsify({
      'to': toAccount,
      'amount': {'doms': icpts.toDoms},
      if(fromSubAccount?.toIntOrNull() != null)
        'fromSubAccountId': fromSubAccount!.toInt()
    })));
    await Future.wait([
      balanceSyncService!.syncBalances(),
      transactionSyncService!.syncAccount(hiveBoxes.wallets.primary)
    ]);
  }

  @override
  Future<void> createNeuron(BigInt stakeInDoms, BigInt dissolveDelayInSecs, String? fromSubAccount) async {
    await promiseToFuture(governanceApi!.createNeuron(jsify({
      'stake': {'doms': stakeInDoms},
      'dissolveDelayInSecs': dissolveDelayInSecs,
      if(fromSubAccount?.toIntOrNull() != null)
        'fromSubAccountId': fromSubAccount!.toInt()
    })));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> startDissolving(BigInt neuronId) async{
    await promiseToFuture(governanceApi!.manageNeuron(jsify({
      'id': { 'id': neuronId },
      'command': {
        'Configure': {
          'operation': {
            'StartDissolving': {}
          }
        }
      }
    })));
    await neuronSyncService!.fetchNeurons();
  }

  @override
  Future<void> stopDissolving(BigInt neuronId) async{
    await promiseToFuture(governanceApi!.manageNeuron(jsify({
      'id': { 'id': neuronId },
      'command': {
        'Configure': {
          'operation': {
            'StopDissolving': {}
          }
        }
      }
    })));
    await neuronSyncService!.fetchNeurons();
  }
}



class AccountsSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  AccountsSyncService(this.ledgerApi, this.hiveBoxes);

  Future<dynamic> performSync() async {
    final accountResponse = await promiseToFuture(ledgerApi.getAccount());
    return Future.wait(<Future<dynamic>>[
      storeNewAccount(
          name: "Default",
          address: accountResponse.accountIdentifier.toString(),
          subAccount: null,
          primary: true),
      ...accountResponse.subAccounts.map((element) => storeNewAccount(
          name: element.name.toString(),
          address: element.accountIdentifier.toString(),
          subAccount: element.id.toString(),
          primary: false))
    ]);
  }

  Future<void> storeNewAccount(
      {required String name,
      required String address,
      required String? subAccount,
      required bool primary}) async {
    if (!hiveBoxes.wallets.containsKey(address)) {
      await hiveBoxes.wallets.put(
          address,
          Wallet.create(
              name: name,
              address: address,
              subAccountId: subAccount,
              primary: primary,
              icpBalance: 0,
              transactions: []));
    }
  }
}

class BalanceSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  BalanceSyncService(this.ledgerApi, this.hiveBoxes);

  Future<void> syncBalances() async {
    Map<String, String> balanceByAddress =
        await fetchBalances(hiveBoxes.wallets.values.map((e) => e.address).toList());
    await Future.wait(balanceByAddress.entries.mapToList((entry) async {
      final account = hiveBoxes.wallets.get(entry.key);
      account!.domsBalance = entry.value;
      await account.save();
    }));
  }

  Future<Map<String, String>> fetchBalances(List<String> accountIds) async {
    final promise = ledgerApi.getBalances(jsify({'accounts': accountIds}));
    final response = await promiseToFutureAsMap(promise);
    return response!.map((key, value) => MapEntry(key, value.doms.toString()));
  }
}

class TransactionSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  TransactionSyncService({required this.ledgerApi, required this.hiveBoxes});

  Future<void> syncAccounts(Iterable<Wallet> accounts) async {
    await Future.wait(accounts.mapToList((e) => syncAccount(e)));
  }

  Future<void> syncAccount(Wallet account) async {
    final response = await promiseToFuture(ledgerApi.getTransactions(jsify(
        {'accountIdentifier': account.address, 'pageSize': 100, 'offset': 0})));

    final transactions = <Transaction>[];
    response.transactions.forEach((e) {
      final send = e.transfer.Send;
      final receive = e.transfer.Receive;

      late String from;
      late String to;
      late String doms;
      if (send != null) {
        from = account.address;
        to = send.to.toString();
        doms = send.amount.doms.toString();
      }
      if (receive != null) {
        to = account.address;
        from = receive.from.toString();
        doms = receive.amount.doms.toString();
      }

      print("from ${from} to ${to}");
      final milliseconds = int.parse(e.timestamp.secs.toString()) * 1000;
      transactions.add(Transaction(
        to: to,
        from: from,
        date: DateTime.fromMillisecondsSinceEpoch(milliseconds),
        domsAmount: doms,
      ));
    });
    print("parsed ${transactions.length} transactions for ${account.address}");

    Future.wait(hiveBoxes.wallets.values.map((e) async {
      e.transactions = transactions
          .filter(
              (element) => element.to == e.address || element.from == e.address)
          .toList();
      e.save();
    }));
  }
}


class NeuronSyncService{
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  NeuronSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchNeurons() async {
    final response = await promiseToFuture(governanceApi.getNeurons());
    response.forEach((e){
      storeNeuron(e);
    });
  }

  void storeNeuron(dynamic e) {
    final neuronId = e.neuronId.toString();
    print("Fetched neuron ${neuronId}");
    if(!hiveBoxes.neurons.containsKey(neuronId)){
      hiveBoxes.neurons.put(neuronId, Neuron(
          address: neuronId,
          durationRemaining: e.dissolveDelaySeconds.toString(),
          timerIsActive: e.state == 2,
          rewardAmount: 0,
          icpBalance: e.votingPower.toString().toICPT
      ));
    }else{
      final neuron = hiveBoxes.neurons.get(neuronId);
      neuron!.timerIsActive =  e.state == 2;
      neuron.save();
    }
  }
}


class ProposalSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchProposals() async {
    final response = await promiseToFuture(governanceApi.getPendingProposals());
    response.forEach((e){
      storeProposal(e);
    });
  }

  void storeProposal(dynamic response) {
    final neuronId = response.id.id.toString();
    print("Fetched proposal ${neuronId}");
    if(!hiveBoxes.proposals.containsKey(neuronId)){
      hiveBoxes.proposals.put(neuronId, Proposal(
           neuronId,
           response.proposal.summary.toString(),
           response.proposal.url,
      ));
    }
  }
}

extension ToJSObject on Map {
  Object toJsObject() {
    var object = newObject();
    this.forEach((k, v) {
      var key = k;
      var value = v;
      setProperty(object, key, value);
    });
    return object;
  }
}
