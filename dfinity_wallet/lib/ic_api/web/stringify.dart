
@JS()
library stringify;

import 'package:js/js.dart';

// Calls invoke JavaScript `JSON.stringify(obj)`.
@JS('Serializer')
external String stringify(Object obj);

@JS('createBigInt')
external dynamic toJSBigInt(String bigIntString);

@JS('getAccountIdentifier')
external dynamic getAccountIdentifier(dynamic ledgerIdentity);

@JS('getPublicKey')
external dynamic getPublicKey(dynamic ledgerIdentity);

extension ToJS on BigInt {
  dynamic get toJS => toJSBigInt(toString());
}