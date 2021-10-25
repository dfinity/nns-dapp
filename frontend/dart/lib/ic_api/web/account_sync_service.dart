import 'dart:convert';
import 'package:nns_dapp/data/icp.dart';
import 'package:universal_html/js_util.dart';
import 'service_api.dart';
import 'stringify.dart';
import '../../nns_dapp.dart';

class AccountsSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  AccountsSyncService(this.serviceApi, this.hiveBoxes);

  Future<void> sync() async {
    print("[${DateTime.now()}] Syncing accounts with a query call...");
    // Do a quick sync with queries.
    await this._sync(useUpdateCalls: false);

    // Do a slow sync with update calls in the background.
    // Note that we don't `await` here as to not block the caller.
    print("[${DateTime.now()}] Syncing accounts with an update call...");
    this
        ._sync(useUpdateCalls: true)
        .then((_) => {print("[${DateTime.now()}] Syncing accounts complete.")});
  }

  Future<void> _sync({required bool useUpdateCalls}) async {
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
}
