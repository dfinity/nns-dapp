import 'dart:convert';
import 'package:nns_dapp/data/icp.dart';
import 'package:universal_html/js_util.dart';
import '../../nns_dapp.dart';
import 'service_api.dart';
import 'stringify.dart';

class BalanceSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  BalanceSyncService(this.serviceApi, this.hiveBoxes);

  Future<void> syncBalances({List<String>? accountIds}) async {
    // Do a quick sync with queries.
    await this._syncBalances(accountIds: accountIds, useUpdateCalls: false);

    // Do a slow sync with update calls in the background.
    // Note that we don't `await` here as to not block the caller.
    this._syncBalances(accountIds: accountIds, useUpdateCalls: true);
  }

  Future<void> _syncBalances(
      {List<String>? accountIds, required bool useUpdateCalls}) async {
    // If no accounts are specified, sync all the accounts.
    accountIds = accountIds ??
        hiveBoxes.accounts.values.map((e) => e.accountIdentifier).toList();
    Map<String, ICP> balanceByAddress = await _fetchBalances(
        accountIds: accountIds, useUpdateCalls: useUpdateCalls);
    balanceByAddress.entries.forEach((entry) {
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
}
