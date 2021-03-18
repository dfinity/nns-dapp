import 'package:dfinity_wallet/service/platform_signing_service.dart';
import 'package:dfinity_wallet/service/stub_signing_service.dart';
import 'package:flutter/services.dart';

class PlatformSigningService extends AbstractPlatformSigningService {

  static const platformChannel = const MethodChannel('internet_computer.signing');

  @override
  Future<String?> createAddressForTag(String tag) async {
    final walletId = tag.replaceAll(" ", "_");
    Map<String, dynamic> response =
            await platformChannel.invokeMapMethod("generateKey", {"walletId": walletId}) ?? {};
    final address = response["publicKey"];
    return address;
  }

}