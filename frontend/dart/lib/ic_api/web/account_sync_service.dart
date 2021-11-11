@JS()
library ic_agent.js;

import 'dart:convert';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/transaction_type.dart';
import 'package:universal_html/js_util.dart';
import 'service_api.dart';
import 'stringify.dart';
import '../../nns_dapp.dart';
import 'package:js/js.dart';

class AccountsSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  /// Initializes an [AccountsSyncService].
  static Future<AccountsSyncService> initialize(
      ServiceApi serviceApi, HiveBoxesWidget hiveBoxesWidget) async {
    final self = AccountsSyncService._(serviceApi, hiveBoxesWidget);

    // Do a quick sync with queries for UI snappiness.
    // Because the queries aren't yet certified, the data isn't fully trusted.
    await self._syncAccounts(useUpdateCalls: false);
    await self._syncAll(useUpdateCalls: false);

    // Because fetching balances and transactions depend on the accounts we
    // have stored, we need to be initialized with the certified accounts.
    // Hence, we fetch them using update calls to get a certified response.
    await self._syncAccounts(useUpdateCalls: true);

    // Now the accounts are certified, which is what all publicly exposed methods
    // in this class assume is always true.
    return self;
  }

  /// Syncs accounts along with their balances and transactions.
  Future<void> syncAll(
      {List<Account>? accounts, bool waitForFullSync = false}) async {
    // Do a quick sync with queries.
    print("[${DateTime.now()}] Syncing accounts with a query call...");
    await this._syncAll(accounts: accounts, useUpdateCalls: false);

    // Do a slow sync with update calls.
    print("[${DateTime.now()}] Syncing accounts with an update call...");
    if (waitForFullSync) {
      // Wait for the sync to happen.
      await this._syncAll(accounts: accounts, useUpdateCalls: true);
      print("[${DateTime.now()}] Syncing accounts complete.");
    } else {
      // The sync happens in the background.
      // Note that we don't `await` here as to not block the caller.
      this._syncAll(accounts: accounts, useUpdateCalls: true).then(
          (_) => {print("[${DateTime.now()}] Syncing accounts complete.")});
    }
  }

  Future<void> syncBalances({List<String>? accountIds}) async {
    // Do a quick sync with queries.
    print("[${DateTime.now()}] Syncing balances with a query call...");
    await this._syncBalances(accountIds: accountIds, useUpdateCalls: false);

    // Do a slow sync with update calls in the background.
    // Note that we don't `await` here as to not block the caller.
    print("[${DateTime.now()}] Syncing balances with an update call...");
    this
        ._syncBalances(accountIds: accountIds, useUpdateCalls: true)
        .then((_) => {print("[${DateTime.now()}] Syncing balances complete.")});
  }

  Future<void> syncTransactions({List<Account>? accounts}) async {
    // Do a quick sync with queries.
    print("[${DateTime.now()}] Syncing transactions with a query call...");
    await this._syncTransactions(accounts, false);

    // Do a slow sync with update calls in the background.
    // Note that we don't `await` here as to not block the caller.
    print("[${DateTime.now()}] Syncing transactions with an update call...");
    this._syncTransactions(accounts, true).then(
        (_) => {print("[${DateTime.now()}] Syncing transactions complete.")});
  }

  AccountsSyncService._(this.serviceApi, this.hiveBoxes);

  Future<void> _syncAll(
      {required bool useUpdateCalls, List<Account>? accounts}) async {
    if (useUpdateCalls) {
      // Only sync accounts when syncing in a certified way.
      // This is to maintain the invariant that accounts are always certified.
      await this._syncAccounts(useUpdateCalls: useUpdateCalls);
    }

    await Future.wait([
      this._syncBalances(
          accountIds: accounts?.map((e) => e.accountIdentifier).toList(),
          useUpdateCalls: useUpdateCalls),
      this._syncTransactions(accounts, useUpdateCalls)
    ]);

    // ignore: deprecated_member_use
    hiveBoxes.accounts.notifyChange();
  }

  Future<void> _syncAccounts({required bool useUpdateCalls}) async {
    final accountResponse =
        await promiseToFuture(serviceApi.getAccount(useUpdateCalls));
    final json = stringify(accountResponse);
    final res = jsonDecode(json);

    final principal = res['principal'].toString();
    final validAccounts = [
      _storeNewAccount(
          name: "Main",
          principal: principal,
          address: res['accountIdentifier'].toString(),
          subAccount: null,
          primary: true,
          hardwareWallet: false),
      ...res['subAccounts']
          .map((element) => _storeSubAccount(element, principal)),
      ...res['hardwareWalletAccounts']
          .map((element) => _storeHardwareWalletAccount(element))
    ];

    final accountsToRemove = hiveBoxes.accounts.values
        .map((a) => a.accountIdentifier)
        .toSet()
        .difference(validAccounts.toSet());

    for (final a in accountsToRemove) {
      hiveBoxes.accounts.remove(a);
    }
  }

  String _storeSubAccount(element, String principal) {
    return _storeNewAccount(
        name: element['name'].toString(),
        principal: principal,
        address: element['accountIdentifier'].toString(),
        subAccount: element['id'],
        primary: false,
        hardwareWallet: false);
  }

  String _storeHardwareWalletAccount(element) {
    return _storeNewAccount(
        name: element['name'].toString(),
        principal: element['principal'].toString(),
        address: element['accountIdentifier'].toString(),
        subAccount: null,
        primary: false,
        hardwareWallet: true);
  }

  String _storeNewAccount(
      {required String name,
      required String principal,
      required String address,
      required int? subAccount,
      required bool primary,
      required bool hardwareWallet}) {
    if (!hiveBoxes.accounts.containsKey(address)) {
      hiveBoxes.accounts[address] = Account(
          name: name,
          principal: principal,
          accountIdentifier: address,
          primary: primary,
          subAccountId: subAccount,
          balance: ICP.zero,
          transactions: [],
          hardwareWallet: hardwareWallet);
    } else {
      final account = hiveBoxes.accounts[address];
      account.name = name;
      hiveBoxes.accounts[address] = account;
    }
    return address;
  }

  Future<void> _syncBalances(
      {List<String>? accountIds, required bool useUpdateCalls}) async {
    // If no accounts are specified, sync all the accounts.
    accountIds = accountIds ??
        hiveBoxes.accounts.values.map((e) => e.accountIdentifier).toList();

    Map<String, ICP> balanceByAddress = await _fetchBalances(
        accountIds: accountIds, useUpdateCalls: useUpdateCalls);
    balanceByAddress.entries.forEach((entry) {
      if (!hiveBoxes.accounts.containsKey(entry.key)) {
        throw Exception(
            "Fetching balance for an unknown account identifier: ${entry.key}");
      }
      final account = hiveBoxes.accounts[entry.key];
      account.balance = entry.value;
    });

    // ignore: deprecated_member_use
    hiveBoxes.accounts.notifyChange();
  }

  Future<Map<String, ICP>> _fetchBalances(
      {required List<String> accountIds, bool useUpdateCalls = false}) async {
    final promise =
        serviceApi.getBalances(jsify({'accounts': accountIds}), useUpdateCalls);
    final jsonString = stringify(await promiseToFuture(promise));
    Map<String, dynamic> response = jsonDecode(jsonString);
    return response.map(
        (key, value) => MapEntry(key, ICP.fromE8s(value.toString().toBigInt)));
  }

  Future<void> _syncTransactions(
      List<Account>? accounts, bool useUpdateCalls) async {
    final accountsToSync = accounts ?? this.hiveBoxes.accounts.values.toList();
    await Future.wait(accountsToSync
        .mapToList((e) => _syncTransactionsForAccount(e, useUpdateCalls)));
  }

  Future<void> _syncTransactionsForAccount(
      Account account, bool useUpdateCalls) async {
    final res = await promiseToFuture(serviceApi.getTransactions(
        GetTransactionsRequest(
            accountIdentifier: account.accountIdentifier,
            pageSize: 100,
            offset: 0),
        useUpdateCalls));
    final response = jsonDecode(stringify(res));
    final transactions = <Transaction>[];
    response['transactions'].forEach((e) {
      final send = e['transfer']['Send'];
      final receive = e['transfer']['Receive'];

      late String from;
      late String to;
      late ICP amount;
      late ICP fee = ICP.zero;
      late TransactionType type =
          TransactionType.values[e['type'].toString().toInt()];
      late bool incomplete = false;
      if (send != null) {
        from = account.accountIdentifier;
        to = send['to'].toString();
        amount = ICP.fromE8s(send['amount'].toString().toBigInt);
        fee = ICP.fromE8s(send["fee"].toString().toBigInt);
        incomplete = send["incomplete"];
      }
      if (receive != null) {
        to = account.accountIdentifier;
        from = receive['from'].toString();
        amount = ICP.fromE8s(receive['amount'].toString().toBigInt);
      }

      final milliseconds =
          BigInt.parse(e['timestamp'].toString()) / BigInt.from(1000000);
      transactions.add(Transaction(
          to: to,
          from: from,
          date: DateTime.fromMillisecondsSinceEpoch(milliseconds.toInt()),
          amount: amount,
          fee: fee,
          type: type,
          memo: e['memo'].toString().toBigInt,
          incomplete: incomplete,
          blockHeight: e['blockHeight'].toString().toBigInt));
    });
    account.transactions = transactions;

    // This if statement is to ensure that the account still exists. There
    // can be subtle cases where, when the accounts are not yet certified, the
    // user requests the transactions of a malicious account identifier. Once
    // the certified accounts arrive, the malicious account will be removed
    // from the state and this condition will be false.
    if (hiveBoxes.accounts.containsKey(account.accountIdentifier)) {
      hiveBoxes.accounts[account.identifier] = account;

      // ignore: deprecated_member_use
      hiveBoxes.accounts.notifyChange();
    }
  }
}

@JS("getTransactions")
@anonymous
class GetTransactionsRequest {
  external String accountIdentifier;
  external int pageSize;
  external int offset;

  external factory GetTransactionsRequest(
      {dynamic accountIdentifier, int pageSize, int offset});
}
