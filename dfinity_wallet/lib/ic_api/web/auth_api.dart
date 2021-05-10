@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'js_utils.dart';


@JS("createAuthApi")
external Promise<dynamic> createAuthApi(Function onLoggedOut);

@JS("AuthApi")
class AuthApi {
  external factory AuthApi();

  @JS("tryGetIdentity")
  external dynamic? tryGetIdentity();

  @JS("login")
  external Promise<dynamic> login(Function onSuccess);

  @JS("logout")
  external Promise<dynamic> logout();

  @JS("getPrincipal")
  external String getPrincipal();

  @JS("connectToHardwareWallet")
  external Promise<dynamic> connectToHardwareWallet();
}