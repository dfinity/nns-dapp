
import 'dart:convert';
import 'dart:js_util';

import 'service_api.dart';
import 'stringify.dart';

import '../../dfinity.dart';

class AccountsSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  AccountsSyncService(this.serviceApi, this.hiveBoxes);

  Future<void> performSync() async {
    final accountResponse = await promiseToFuture(serviceApi.getAccount());
    final json = stringify(accountResponse);
    final cachedAccounts = hiveBoxes.accounts.values;
    final res = jsonDecode(json);

    final validAccounts = await Future.wait(<Future<dynamic>>[
      storeNewAccount(
          name: "Main",
          address: res['accountIdentifier'].toString(),
          subAccount: null,
          primary: true,
          hardwareWallet: false),
      ...res['subAccounts'].map((element) => storeSubAccount(element)),
      ...res['hardwareWalletAccounts'].map((element) => storeHardwareWalletAccount(element))
    ]);

   cachedAccounts
       .filterNot((element) => validAccounts.contains(element.accountIdentifier))
        .forEach((element) => hiveBoxes.accounts.remove(element.accountIdentifier));
  }

  Future<String> storeSubAccount(element) {
    return storeNewAccount(
        name: element['name'].toString(),
        address: element['accountIdentifier'].toString(),
        subAccount: element['id'],
        primary: false,
        hardwareWallet: false);
  }


  Future<String> storeHardwareWalletAccount(element) {
    return storeNewAccount(
        name: element['name'].toString(),
        address: element['accountIdentifier'].toString(),
        subAccount: null,
        primary: false,
        hardwareWallet: true);
  }

  Future<String> storeNewAccount(
      {required String name,
        required String address,
        required int? subAccount,
        required bool primary,
        required bool hardwareWallet}) async {
    if (!hiveBoxes.accounts.containsKey(address)) {
      hiveBoxes.accounts[address] = Account.create(
              name: name,
              accountIdentifier: address,
              subAccountId: subAccount,
              primary: primary,
              balance: BigInt.zero.toString(),
              transactions: [],
              hardwareWallet: hardwareWallet
          );
    }else{
      final account = await hiveBoxes.accounts[address];
      account.name = name;
      hiveBoxes.accounts[address] = account;
    }
    return address;
  }
}
