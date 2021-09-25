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

  Future<void> syncBalances() async {
    Map<String, ICP> balanceByAddress = await fetchBalances(
        hiveBoxes.accounts.values.map((e) => e.accountIdentifier).toList());
    balanceByAddress.entries.forEach((entry) {
      final account = hiveBoxes.accounts[entry.key];
      account.balance = entry.value;
    });
    // ignore: deprecated_member_use
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
