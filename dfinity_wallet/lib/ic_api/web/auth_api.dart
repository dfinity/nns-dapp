@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'js_utils.dart';


@JS("createAuthApi")
external Promise<dynamic> createAuthApi();

@JS("AuthApi")
class AuthApi {
  external factory AuthApi();

  @JS("tryGetIdentity")
  external dynamic? tryGetIdentity();

  @JS("login")
  external Promise<dynamic> login(Function onSuccess);

  @JS("createDelegationIdentity")
  external dynamic createDelegationIdentity(String key, String accessToken);

  @JS("createDelegationIdentity")
  external Promise<dynamic> createAuthenticationIdentity();

  @JS("connectToHardwareWallet")
  external Promise<dynamic> connectToHardwareWallet();
}