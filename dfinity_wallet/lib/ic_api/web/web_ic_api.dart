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
    final hiveBoxes = context.boxes;
    final token = hiveBoxes.authToken.webAuthToken;
    if (token != null && token.data != null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      //const gatewayHost = "http://localhost:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      ledgerApi = new LedgerApi(gatewayHost, identity);
      final accountResponse =
          await promiseToFutureAsMap(ledgerApi!.getAccount());
      final account = AccountDetails(accountResponse!);

      print("Account $account");
      final accountSync = AccountSyncService(ledgerApi!, hiveBoxes);
      accountSync.syncWallets(account);
    }
  }

  @override
  Future<void> acquireICPTs(String accountIdentifier, BigInt doms) {
    return ledgerApi!.acquireICPTs(accountIdentifier, jsify({'doms': doms})).toFuture();
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

  void syncWallets(AccountDetails accountDetails) async {
    Map<String, String> balanceByAddress = await fetchBalances([
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

  Future<void> createOrUpdateWallet(String accountIdentifier, String name,
      bool primary, Map<String, String> balanceByAddress) async {
    if (!accountsByAddress.containsKey(accountIdentifier)) {
      await hiveBoxes.wallets.put(
          accountIdentifier,
          Wallet(name, accountIdentifier, primary,
              balanceByAddress[accountIdentifier]!));
    } else {
      final wallet = accountsByAddress[accountIdentifier]!;
      wallet.domsBalance = balanceByAddress[accountIdentifier]!.toString();
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
