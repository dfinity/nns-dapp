
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

import '../dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi{
  @override
  void authenticate() {
    throw UnimplementedError();
  }

  Future<void> buildServices(BuildContext context) async {

  }
}