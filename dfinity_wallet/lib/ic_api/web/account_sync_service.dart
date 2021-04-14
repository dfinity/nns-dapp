
import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/ledger_api.dart';

import '../../dfinity.dart';

class AccountsSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  AccountsSyncService(this.ledgerApi, this.hiveBoxes);

  Future<void> performSync() async {
    final accountResponse = await promiseToFuture(ledgerApi.getAccount());

    final cachedAccounts = hiveBoxes.wallets.values;

    final validAccounts = await Future.wait(<Future<dynamic>>[
      storeNewAccount(
          name: "Default",
          address: accountResponse.accountIdentifier.toString(),
          subAccount: null,
          primary: true),
      ...accountResponse.subAccounts.map((element) => storeNewAccount(
          name: element.name.toString(),
          address: element.accountIdentifier.toString(),
          subAccount: element.id,
          primary: false))
    ]);

   await Future.wait(cachedAccounts
       .filterNot((element) => validAccounts.contains(element.accountIdentifier))
        .map((element) => hiveBoxes.wallets.delete(element.accountIdentifier)));
  }

  Future<String> storeNewAccount(
      {required String name,
        required String address,
        required int? subAccount,
        required bool primary}) async {
    if (!hiveBoxes.wallets.containsKey(address)) {
      await hiveBoxes.wallets.put(
          address,
          Wallet.create(
              name: name,
              accountIdentifier: address,
              subAccountId: subAccount,
              primary: primary,
              balance: BigInt.zero.toString(),
              transactions: [],
          ));
    }
    return address;
  }
}
