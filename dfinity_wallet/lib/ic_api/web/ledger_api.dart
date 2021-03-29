@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'promise.dart';

@JS("LedgerApi")
class LedgerApi {
  external factory LedgerApi(String host, dynamic identity);

  @JS("acquireICPTs")
  external Promise<void> acquireICPTs(ICPTs icpts);

  @JS("getAccount")
  external Promise<AccountDetails> getAccount();
}
