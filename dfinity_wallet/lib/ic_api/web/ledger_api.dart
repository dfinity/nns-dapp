@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'promise.dart';

@JS("LedgerApi")
class LedgerApi {
  external factory LedgerApi(String host, dynamic identity);

  @JS("acquireICPTs")
  external Promise<void> acquireICPTs(Object icpts);

  @JS("getAccount")
  external Promise<dynamic> getAccount();

  @JS("getAccount")
  external Promise<dynamic> getBalance(dynamic request);
}
