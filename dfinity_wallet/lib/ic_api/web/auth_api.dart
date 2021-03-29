@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'promise.dart';


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