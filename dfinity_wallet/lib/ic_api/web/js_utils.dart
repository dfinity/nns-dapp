import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'dart:js_util';
import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:js/js.dart';
import 'dart:collection' show Maps;


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

Future<Map<String, dynamic>> callApi(
    dynamic Function(dynamic) function, Map<String, dynamic> input, {String? debugLabel}) {

  if(debugLabel!= null){
    print("${debugLabel} request\n ${input}");
  }
  return promiseToFuture(function(jsify(input))).then((value) {
    final json = stringify(value);
    if(debugLabel!= null){
      print("${debugLabel} response\n ${json}");
    }
    return jsonDecode(json);
  });
}

Future<Map<String, dynamic>> callApiMap(
    dynamic Function(dynamic) function, Map<String, dynamic> input) async {
  return (await promiseToFutureAsMap(function(jsify(input))))!;
}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));

  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

extension AsFuture<T> on Promise<T>{
  Future<T> toFuture() => promiseToFuture(this);
}
