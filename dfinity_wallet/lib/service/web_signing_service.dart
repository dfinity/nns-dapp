@JS()
library dfinity_agent.js;

import 'dart:js_util';

import 'package:dfinity_wallet/service/platform_signing_service.dart';
import 'package:dfinity_wallet/service/stub_signing_service.dart';
import 'package:js/js.dart';


import 'package:uuid/uuid.dart';


@JS("AuthenticationProxy")
class AuthenticationProxy {
  external factory AuthenticationProxy();

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> createAuthenticationIdentity();
}

@JS("WebAuthnIdentity")
class WebAuthnIdentity {
  @JS("createAuthenticationIdentity")
   external dynamic getPublicKey();
}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));
  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

class PlatformSigningService extends AbstractPlatformSigningService {

  @override
  Future<String> createAddressForTag(String tag) async {

    final authProxy = new AuthenticationProxy();
    final identityPromise = authProxy.createAuthenticationIdentity();
    print("identityPromise $identityPromise");
    final identity = await promiseToFuture(identityPromise);
    print("test ${identity}");
    print("test ${identity.getPublicKey()}");
    print("test ${identity.getPublicKey().toDer()}");

    // final principal = Principal.anonymous();
    // bool isAnon = principal.isAnonymous();
    // print("is Anon ${isAnon}");
    return Uuid().v4();
  }

}

