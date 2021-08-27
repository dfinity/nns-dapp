@JS()
library ic_agent.js;

import 'package:universal_html/js_util.dart';
import 'package:js/js.dart';

extension ToJSObject on Map {
  Object toJsObject() {
    var object = newObject();
    this.forEach((k, v) {
      var key = k;
      var value = v;
      setProperty(object, key, value);
    });
    return object;
  }
}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));
  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

extension AsFuture<T> on Promise<T> {
  Future<T> toFuture() => promiseToFuture(this);
}
