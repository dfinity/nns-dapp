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
    authApi.loginWithIdentityProvider(key, "http://" + window.location.host + "/home");
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
      final account = await ledgerApi!.getAccount().toFuture();
      // print("Account : ${account.defaultAccount}, ${account.subAccounts}");

      updateWallets(context, account);
    }
  }

  void updateWallets(BuildContext context, AccountDetails accountDetails) {
    final wallets =  context.boxes.wallets.values;

  }

  @override
  Future<void> acquireICPTs(ICPTs icpts) {
    return ledgerApi!.acquireICPTs(icpts).toFuture();
  }
}
