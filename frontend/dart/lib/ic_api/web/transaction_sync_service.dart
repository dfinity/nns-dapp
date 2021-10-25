@JS()
library ic_agent.js;

import 'dart:convert';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/transaction_type.dart';
import 'package:universal_html/js_util.dart';
import 'service_api.dart';
import '../../nns_dapp.dart';
import 'stringify.dart';
import 'package:js/js.dart';

class TransactionSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  TransactionSyncService({required this.serviceApi, required this.hiveBoxes});

  Future<void> syncAllAccounts({List<Account>? accounts}) async {
    await this._syncAccounts(accounts ?? hiveBoxes.accounts.values);
  }

  Future<void> _syncAccounts(Iterable<Account> accounts) async {
    await Future.wait(accounts.mapToList((e) => syncAccount(e)));
  }

  Future<void> syncAccount(Account account) async {
    print(
        "${DateTime.now()}] Syncing transactions of ${account.accountIdentifier} with a query call...");
    await this._syncAccount(account, false);

    // Do a slow sync with update calls in the background.
    // Note that we don't `await` here as to not block the caller.
    print(
        "${DateTime.now()}] Syncing transactions of ${account.accountIdentifier} with an update call...");
    this._syncAccount(account, true).then((_) => {
          print(
              "${DateTime.now()}] Syncing transactions of account ${account.accountIdentifier} complete.")
        });
  }

  Future<void> _syncAccount(Account account, bool useUpdateCalls) async {
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
    hiveBoxes.accounts[account.identifier] = account;

    // ignore: deprecated_member_use
    hiveBoxes.accounts.notifyChange();
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
