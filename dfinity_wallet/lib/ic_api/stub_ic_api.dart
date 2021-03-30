
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

import '../dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi{
  @override
  void authenticate(BuildContext context) {
    throw UnimplementedError();
  }

  Future<void> buildServices(BuildContext context) async {

  }

  @override
  Future<void> acquireICPTs(String accountIdentifier, BigInt doms) {
    throw UnimplementedError();
  }
}