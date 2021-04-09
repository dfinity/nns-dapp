
import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/ledger_api.dart';

import '../../dfinity.dart';

class AccountsSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;

  AccountsSyncService(this.ledgerApi, this.hiveBoxes);

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
          subAccount: element.id,
          primary: false))
    ]);
  }

  Future<void> storeNewAccount(
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
  }
}
