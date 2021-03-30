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
  LedgerApi? ledgerApi;

  @override
  void authenticate(BuildContext context) async {
    await context.boxes.authToken.clear();

    final key = authApi.createKey();
    context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    authApi.loginWithIdentityProvider(
        key, "http://" + window.location.host + "/home");
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    buildServices(context);
  }

  Future<void> buildServices(BuildContext context) async {
    final token = context.boxes.authToken.webAuthToken;
    if (token != null && token.data != null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      //const gatewayHost = "http://localhost:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      ledgerApi = new LedgerApi(gatewayHost, identity);
      final accountResponse = await promiseToFutureAsMap(ledgerApi!.getAccount());
      final account = AccountDetails(accountResponse!);

      print("Account $account");
      final accountSync = AccountSyncService(ledgerApi!, context);
      accountSync.syncWallets(account);
    }
  }

  @override
  Future<void> acquireICPTs(ICPTs icpts) {
    return ledgerApi!.acquireICPTs(icpts).toFuture();
  }
}

class AccountSyncService {
  final LedgerApi ledgerApi;
  final BuildContext context;
  late Map<String, Wallet> accountsByAddress;

  AccountSyncService(this.ledgerApi, this.context) {
    final wallets = context.boxes.wallets.values;
    accountsByAddress = wallets.associateBy((element) => element.address);
  }

  void syncWallets(AccountDetails accountDetails) async {
    Map<String, int> balanceByAddress = await fetchBalances([
      accountDetails.defaultAccount.toString(),
      ...accountDetails.subAccounts.map((e) => e.accountIdentifier)
    ]);

    createOrUpdateWallet(
        accountDetails.defaultAccount, "Default", true, balanceByAddress);
    accountDetails.subAccounts.forEach((element) {
      createOrUpdateWallet(
          element.accountIdentifier, element.name, false, balanceByAddress);
    });
  }

  void createOrUpdateWallet(String accountIdentifier, String name, bool primary,
      Map<String, int> balanceByAddress) {
    // final publicKey = principal.toString();
    // if (accountsByAddress.containsKey(publicKey)) {
    //   // context.boxes.wallets.put(publicKey, Wallet(name, publicKey, primary));
    // } else {
    //   final wallet = accountsByAddress[publicKey]!;
    // }
  }

  Future<Map<String, int>> fetchBalances(List<String> accountIds) async {
    return Map.fromEntries(await Future.wait(accountIds.map((element) async {
      final promise = ledgerApi.getBalance({'account': element}.toJsObject());
      final response = await promiseToFutureAsMap(promise);
      return MapEntry(element, response!['doms'].toString().toInt());
    })));
  }
}


extension ToJSObject on Map {
  Object toJsObject(){
    var object = newObject();
    this.forEach((k, v) {
      var key = k;
      var value = v;
      setProperty(object, key, value);
    });
    return object;
  }
}