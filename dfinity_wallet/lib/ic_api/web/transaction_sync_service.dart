
import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/js_utils.dart';
import 'package:dfinity_wallet/ic_api/web/ledger_api.dart';

import '../../dfinity.dart';
import 'stringify.dart';

class TransactionSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  TransactionSyncService({required this.ledgerApi, required this.hiveBoxes});

  Future<void> syncAccounts(Iterable<Account> accounts) async {
    await Future.wait(accounts.mapToList((e) => syncAccount(e)));
  }

  Future<void> syncAccount(Account account) async {
    final response = await callApi(ledgerApi.getTransactions, {'accountIdentifier': account.accountIdentifier, 'pageSize': 100, 'offset': 0});
    // print("Transactions response: " + stringify(response));

    final transactions = <Transaction>[];
    response['transactions'].forEach((e) {
      final send = e['transfer']['Send'];
      final receive = e['transfer']['Receive'];

      late String from;
      late String to;
      late BigInt doms;
      if (send != null) {
        from = account.accountIdentifier;
        to = send['to'].toString();
        doms = BigInt.parse(send['amount'].toString());
      }
      if (receive != null) {
        to = account.accountIdentifier;
        from = receive['from'].toString();
        doms = BigInt.parse(receive['amount'].toString());
      }

      final milliseconds = BigInt.parse(e['timestamp'].toString()) / BigInt.from(1000000);
      transactions.add(Transaction(
        to: to,
        from: from,
        date: DateTime.fromMillisecondsSinceEpoch(milliseconds.toInt()),
        doms: doms.toString(),
        fee: e['fees'].toString()
      ));
    });
    // print("parsed ${transactions.length} transactions for ${account.accountIdentifier}");

    Future.wait(hiveBoxes.accounts.values.map((e) async {
      e.transactions = transactions
          .filter(
              (element) => element.to == e.accountIdentifier || element.from == e.accountIdentifier)
          .toList();
      e.save();
    }));
  }
}
