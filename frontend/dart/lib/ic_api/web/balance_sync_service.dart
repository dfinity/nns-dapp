import 'dart:convert';
import 'package:universal_html/js_util.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';
import 'service_api.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'stringify.dart';

class BalanceSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  BalanceSyncService(this.serviceApi, this.hiveBoxes);

  Future<void> syncBalances() async {
    Map<String, ICP> balanceByAddress = await fetchBalances(
        hiveBoxes.accounts.values.map((e) => e.accountIdentifier).toList());
    balanceByAddress.entries.forEach((entry) {
      final account = hiveBoxes.accounts[entry.key];
      account.balance = entry.value;
    });
    hiveBoxes.accounts.notifyChange();
  }

  Future<Map<String, ICP>> fetchBalances(List<String> accountIds) async {
    final promise = serviceApi.getBalances(jsify({'accounts': accountIds}));
    final jsonString = stringify(await promiseToFuture(promise));
    Map<String, dynamic> response = jsonDecode(jsonString);
    return response.map(
        (key, value) => MapEntry(key, ICP.fromE8s(value.toString().toBigInt)));
  }
}
