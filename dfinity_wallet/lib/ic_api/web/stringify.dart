
@JS()
library stringify;

import 'package:js/js.dart';

// Calls invoke JavaScript `JSON.stringify(obj)`.
@JS('Serializer')
external String stringify(Object obj);

@JS('createBigInt')
external dynamic toJSBigInt(String bigIntString);

extension ToJS on BigInt {
  dynamic get toJS => toJSBigInt(toString());
}