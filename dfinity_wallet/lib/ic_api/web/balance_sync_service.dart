
import 'dart:convert';
import 'dart:html';
import 'dart:js_util';
import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';
import 'ledger_api.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'stringify.dart';

class BalanceSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  BalanceSyncService(this.ledgerApi, this.hiveBoxes);

  Future<void> syncBalances() async {
    Map<String, String> balanceByAddress = await fetchBalances(
        hiveBoxes.accounts.values.map((e) => e.accountIdentifier).toList());
    await Future.wait(balanceByAddress.entries.mapToList((entry) async {
      final account = hiveBoxes.accounts.get(entry.key);
      account!.balance = entry.value.toString();
      await account.save();
    }));
  }

  Future<Map<String, String>> fetchBalances(List<String> accountIds) async {
    final promise = ledgerApi.getBalances(jsify({'accounts': accountIds}));
    final jsonString = stringify(await promiseToFuture(promise));
    Map<String, dynamic> response = jsonDecode(jsonString);
    return response.map((key, value) => MapEntry(key, value.toString()));
  }
}
