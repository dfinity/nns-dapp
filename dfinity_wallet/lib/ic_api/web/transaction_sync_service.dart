
import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/js_utils.dart';
import 'package:dfinity_wallet/ic_api/web/ledger_api.dart';

import '../../dfinity.dart';

class TransactionSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  TransactionSyncService({required this.ledgerApi, required this.hiveBoxes});

  Future<void> syncAccounts(Iterable<Wallet> accounts) async {
    await Future.wait(accounts.mapToList((e) => syncAccount(e)));
  }

  Future<void> syncAccount(Wallet account) async {
    final response = await callApi(ledgerApi.getTransactions, {'accountIdentifier': account.address, 'pageSize': 100, 'offset': 0});

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
