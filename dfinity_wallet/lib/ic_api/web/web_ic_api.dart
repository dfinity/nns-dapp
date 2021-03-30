@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:hive/hive.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../../dfinity.dart';
import 'auth_api.dart';
import 'ledger_api.dart';
import 'promise.dart';

class PlatformICApi extends AbstractPlatformICApi {
  final authApi = new AuthApi();
  late HiveBoxesWidget hiveBoxes;
  LedgerApi? ledgerApi;
  AccountsSyncService? accountsSyncService;
  BalanceSyncService? balanceSyncService;
  TransactionSyncService? transactionSyncService;

  @override
  void authenticate(BuildContext context) async {
    await hiveBoxes.authToken.clear();

    final key = authApi.createKey();
    context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
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

      // @Gilbert perhaps this could be triggered from a button?
      // Also this is being hit twice for some reason
//      await promiseToFuture(ledgerApi!.integrationTest());

      accountsSyncService = AccountsSyncService(ledgerApi!, hiveBoxes.wallets);
      balanceSyncService = BalanceSyncService(ledgerApi!, hiveBoxes.wallets);
      transactionSyncService = TransactionSyncService(ledgerApi: ledgerApi!, accountsBox: hiveBoxes.wallets);
      await accountsSyncService!.performSync();
      await balanceSyncService!.syncBalances();
      await transactionSyncService!.syncAccount(hiveBoxes.wallets.primary);
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
    final namedSubAccount = response.Ok;
    final address = namedSubAccount.accountIdentifier;
    final newWallet = Wallet(
        namedSubAccount.name,
        address.toString(),
        false,
        "0",
        namedSubAccount.subAccountId.map((e) => e.toInt()).toList().cast<int>(),
        []);
    await hiveBoxes.wallets.put(address.toString(), newWallet);
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
}

class AccountsSyncService {
  final LedgerApi ledgerApi;
  final Box<Wallet> accountBox;

  AccountsSyncService(this.ledgerApi, this.accountBox);

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
    if (!accountBox.containsKey(address)) {
      await accountBox.put(
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
  final Box<Wallet> accountBox;

  BalanceSyncService(this.ledgerApi, this.accountBox);

  Future<void> syncBalances() async {
    Map<String, String> balanceByAddress =
        await fetchBalances(accountBox.values.map((e) => e.address).toList());
    await Future.wait(balanceByAddress.entries.mapToList((entry) async {
      final account = accountBox.get(entry.key);
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
  final Box<Wallet> accountsBox;

  TransactionSyncService({required this.ledgerApi, required this.accountsBox});

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

    Future.wait(accountsBox.values.map((e) async {
      e.transactions = transactions
          .filter(
              (element) => element.to == e.address || element.from == e.address)
          .toList();
      e.save();
    }));
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
