@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:js/js.dart';
import 'dart:html';

import '../dfinity.dart';

@JS("AuthApi")
class AuthApi {
  external factory AuthApi();

  @JS("createKey")
  external String createKey();

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> loginWithIdentityProvider(
      String key, String returnUrl);

  @JS("createDelegationIdentity")
  external dynamic createDelegationIdentity(String key, String accessToken);

  @JS("createDelegationIdentity")
  external Promise<dynamic> createAuthenticationIdentity();
}

@JS("LedgerApi")
class LedgerApi {
  external factory LedgerApi(String host, dynamic identity);

  @JS("acquireICPTs")
  external Promise<void> acquireICPTs(ICPTs icpts);

  @JS("getAccount")
  external Promise<AccountDetails> getAccount();
}

class ICPTs {
  ICPTs({required this.doms});
  BigInt doms;
}

class AccountDetails {
  external Principal defaultAccount;
  external List<NamedSubAccount> subAccounts;
}

class NamedSubAccount {
  late Principal principal;
  late String name;
  dynamic subAccount;
}

class Principal {

}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));

  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

extension AsFuture<T> on Promise<T>{
  Future<T> toFuture() => promiseToFuture(this);
}

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
      print("Account : ${account.defaultAccount}, ${account.subAccounts}");
    }
  }

  @override
  Future<void> acquireICPTs(ICPTs icpts) {
    return ledgerApi!.acquireICPTs(icpts).toFuture();
  }
}
