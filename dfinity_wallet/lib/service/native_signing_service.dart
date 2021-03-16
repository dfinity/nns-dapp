import 'package:dfinity_wallet/service/platform_signing_service.dart';
import 'package:dfinity_wallet/service/stub_signing_service.dart';

class NativeSigningService extends AbstractPlatformSigningService {
  @override
  Future<String> createAddressForTag(String tag) {
    throw UnimplementedError();
  }

}