@JS()
library ic_agent.js;

import 'package:js/js.dart';

import 'js_utils.dart';

@JS("createAuthApi")
external Promise<AuthApi> createAuthApi(Function onLoggedOut);

@JS("AuthApi")
class AuthApi {
  @JS("tryGetIdentity")
  external dynamic? tryGetIdentity();

  @JS("login")
  external Promise<dynamic> login(Function onSuccess);

  @JS("logout")
  external Promise<dynamic> logout();

  @JS("getTimeUntilSessionExpiryMs")
  external int? getTimeUntilSessionExpiryMs();

  @JS("getPrincipal")
  external String? getPrincipal();

  @JS("connectToHardwareWallet")
  external Promise<dynamic> connectToHardwareWallet();
}