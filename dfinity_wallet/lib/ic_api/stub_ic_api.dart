
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
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
  Future<void> acquireICPTs({required String accountIdentifier, required BigInt doms}) {
    // TODO: implement acquireICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> createNeuron({required BigInt stakeInDoms, required BigInt dissolveDelayInSecs, String? fromSubAccount}) {
    // TODO: implement createNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> createSubAccount({required String name}) {
    // TODO: implement createSubAccount
    throw UnimplementedError();
  }

  @override
  Future<void> disburse({required BigInt neuronId, required BigInt doms, BigInt? toSubaccountId}) {
    // TODO: implement disburse
    throw UnimplementedError();
  }

  @override
  Future<void> disburseToNeuron({required BigInt neuronId, required BigInt dissolveDelaySeconds, required BigInt doms}) {
    // TODO: implement disburseToNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> follow({required BigInt neuronId, required Topic topic, required BigInt followee}) {
    // TODO: implement follow
    throw UnimplementedError();
  }

  @override
  Future<void> increaseDissolveDelay({required BigInt neuronId, required BigInt additionalDissolveDelaySeconds}) {
    // TODO: implement increaseDissolveDelay
    throw UnimplementedError();
  }

  @override
  Future<void> makeMotionProposal({required BigInt neuronId, required String url, required String text, required String summary}) {
    // TODO: implement makeMotionProposal
    throw UnimplementedError();
  }

  @override
  Future<void> registerVote({required BigInt neuronId, required BigInt proposalId, required Vote vote}) {
    // TODO: implement registerVote
    throw UnimplementedError();
  }

  @override
  Future<void> sendICPTs({required String toAccount, required BigInt doms, String? fromSubAccount}) {
    // TODO: implement sendICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> startDissolving({required BigInt neuronId}) {
    // TODO: implement startDissolving
    throw UnimplementedError();
  }

  @override
  Future<void> stopDissolving({required BigInt neuronId}) {
    throw UnimplementedError();
  }


}