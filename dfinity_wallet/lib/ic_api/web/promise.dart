
import 'package:js/js.dart';

import 'dart:js_util';

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));

  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

extension AsFuture<T> on Promise<T>{
  Future<T> toFuture() => promiseToFuture(this);
}