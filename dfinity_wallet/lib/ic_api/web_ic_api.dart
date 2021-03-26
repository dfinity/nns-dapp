@JS()
library dfinity_agent.js;

import 'dart:js_util';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:js/js.dart';
import 'package:uuid/uuid.dart';
import 'dart:html';

import '../dfinity.dart';

@JS("AuthApi")
class AuthApi {
  external factory AuthApi();

  @JS("createKey")
  external String createKey();

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> loginWithIdentityProvider(String key, String returnUrl);

  @JS("createDelegationIdentity")
  external dynamic createDelegationIdentity(String key, String accessToken);

  @JS("createDelegationIdentity")
  external Promise<dynamic> createAuthenticationIdentity();
}

@JS("WalletApi")
class WalletApi {
  external factory WalletApi(String host, dynamic identity);
}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));

  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

class PlatformICApi extends AbstractPlatformICApi {
  final authApi = new AuthApi();
  var walletApi;

  @override
  void authenticate(BuildContext context) async {
    await context.boxes.authToken.clear();

    final key = authApi.createKey();
    context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    authApi.loginWithIdentityProvider(key, "http://" + window.location.host + "/home");
  }

  @override
  void didChangeDependencies(){
    super.didChangeDependencies();
    buildServices(context);
  }

  Future<void> buildServices(BuildContext context) async {
    final token = context.boxes.authToken.webAuthToken;
    if (token != null && token.data != null) {
      const gatewayHost = "http://10.12.31.5:8080/";
      final identity = authApi.createDelegationIdentity(token.key, token.data!);
      walletApi = new WalletApi(gatewayHost, identity);
    }
  }
}
