
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


  @override
  Future<void> startDissolving(BigInt neuronId) {
    // TODO: implement startDissolving
    throw UnimplementedError();
  }

  @override
  Future<void> stopDissolving(BigInt neuronId) {
    // TODO: implement stopDissolving
    throw UnimplementedError();
  }
}