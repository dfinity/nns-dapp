import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ic_api/stub_ic_api.dart';
import 'package:flutter/services.dart';

import '../dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi {

  static const platformChannel = const MethodChannel('internet_computer.signing');

  @override
  void authenticate(BuildContext context) {
    final walletId = "".replaceAll(" ", "_");
    // Map<String, dynamic> response =
    //         await platformChannel.invokeMapMethod("generateKey", {"walletId": walletId}) ?? {};
    // final address = response["publicKey"];
    // return address;
  }

  Future<void> buildServices(BuildContext context) async {

  }

  @override
  Future<void> acquireICPTs(String accountIdentifier, BigInt doms) {
    // TODO: implement acquireICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> createSubAccount(String name) {
    // TODO: implement createSubAccount
    throw UnimplementedError();
  }

  @override
  Future<void> sendICPTs(String toAccount, double icpts, String? fromSubAccount) {
    // TODO: implement sendICPTs
    throw UnimplementedError();
  }


  @override
  Future<void> createNeuron(BigInt stakeInDoms, BigInt dissolveDelayInSecs, String? fromSubAccount) async {

  }
}