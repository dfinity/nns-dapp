@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../../dfinity.dart';
import 'auth_api.dart';
import 'ledger_api.dart';
import 'promise.dart';

class PlatformICApi extends AbstractPlatformICApi {
  final authApi = new AuthApi();
  late HiveBoxesWidget hiveBoxes;
  LedgerApi? ledgerApi;

  @override
  void authenticate(BuildContext context) async {
    await hiveBoxes.authToken.clear();

    final key = authApi.createKey();
    context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    authApi.loginWithIdentityProvider(
        key, "http://" + window.location.host + "/home");
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    hiveBoxes = context.boxes;
    buildServices(context);
  }

  Future<void> buildServices(BuildContext context) async {
    final token = hiveBoxes.authToken.webAuthToken;
    if (token != null && token.data != null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      //const gatewayHost = "http://localhost:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      ledgerApi = new LedgerApi(gatewayHost, identity);
      final accountResponse = await promiseToFuture(ledgerApi!.getAccount());

      final accountSync = AccountSyncService(ledgerApi!, hiveBoxes);
      accountSync.syncWallets(accountResponse);
    }
  }

  @override
  Future<void> acquireICPTs(String accountIdentifier, BigInt doms) {
    return ledgerApi!
        .acquireICPTs(accountIdentifier, jsify({'doms': doms}))
        .toFuture();
  }

  @override
  Future<void> createSubAccount(String name) async {
    final response = await promiseToFuture(ledgerApi!.createSubAccount(name));
    final namedSubAccount = response.Ok;
    final address = namedSubAccount.accountIdentifier;
    await hiveBoxes.wallets.put(
        address.toString(),
        Wallet(
            namedSubAccount.name,
            address.toString(),
            false,
            "0",
            namedSubAccount.subAccount.map((e) => e.toInt()).toList().cast<int>()
        )
    );
  }

  @override
  Future<void> sendICPTs(String toAccount, double icpts, String fromSubAccount) async {
    await promiseToFuture(ledgerApi!.sendICPTs(jsify({
      'to': toAccount,
      'amount': {
        'doms' : icpts.toDoms
      }
    })));
  }
}

class AccountSyncService {
  final LedgerApi ledgerApi;
  final HiveBoxesWidget hiveBoxes;
  late Map<String, Wallet> accountsByAddress;

  AccountSyncService(this.ledgerApi, this.hiveBoxes) {
    final wallets = hiveBoxes.wallets.values;
    accountsByAddress = wallets.associateBy((element) => element.address);
  }

  void syncWallets(dynamic accountDetails) async {
    Map<String, String> balanceByAddress = await fetchBalances([
      accountDetails.accountIdentifier.toString(),
      ...accountDetails.subAccounts.map((e) => e.accountIdentifier.toString())
    ]);

    createOrUpdateWallet(accountDetails.accountIdentifier.toString(), "Default", true, balanceByAddress, null);
    accountDetails.subAccounts.forEach((element) {
      final sub =  element.subAccount.map((e) => e.toInt()).toList().cast<int>();
      createOrUpdateWallet(
          element.accountIdentifier.toString(),
          element.name.toString(),
          false,
          balanceByAddress,
          sub
      );
    });
  }

  Future<void> createOrUpdateWallet(
      String accountIdentifier,
      String name,
      bool primary,
      Map<String, String> balanceByAddress,
      List<int>? subAccount
      ) async {
    print("1");
    if (!accountsByAddress.containsKey(accountIdentifier)) {
      print("2");
      await hiveBoxes.wallets.put(
          accountIdentifier,
          Wallet(name, accountIdentifier, primary, balanceByAddress[accountIdentifier] ?? "0", subAccount));
    } else {
      print("3");
      final wallet = accountsByAddress[accountIdentifier]!;
      print("4");
      wallet.domsBalance = balanceByAddress[accountIdentifier]!.toString();
      print("5");
      await wallet.save();
    }
  }

  Future<Map<String, String>> fetchBalances(List<String> accountIds) async {
    final promise = ledgerApi.getBalances(jsify({'accounts': accountIds}));
    final response = await promiseToFutureAsMap(promise);
    return response!.map((key, value) => MapEntry(key, value.doms.toString()));
  }
}

extension ToJSObject on Map {
  Object toJsObject() {
    var object = newObject();
    this.forEach((k, v) {
      var key = k;
      var value = v;
      setProperty(object, key, value);
    });
    return object;
  }
}
