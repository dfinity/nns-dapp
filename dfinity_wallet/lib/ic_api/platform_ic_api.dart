import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';

import '../dfinity.dart';

abstract class AbstractPlatformICApi {
  final HiveBoxesWidget hiveBoxes;

  AbstractPlatformICApi(this.hiveBoxes){
    buildServices();
  }

  void authenticate(BuildContext context);

  Future<void> buildServices();

  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms});

  Future<void> createSubAccount({required String name});

  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt doms,
        int? fromSubAccount});

  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      required BigInt dissolveDelayInSecs,
        int? fromSubAccount});

  Future<void> startDissolving({required BigInt neuronId});

  Future<void> stopDissolving({required BigInt neuronId});

  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required BigInt additionalDissolveDelaySeconds});

  @override
  Future<void> follow(
      {required BigInt neuronId,
        required Topic topic,
        required List<BigInt> followees});

  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote});



  Future<void> disburse(
      {required BigInt neuronId, required BigInt doms, BigInt? toSubaccountId});

  Future<void> disburseToNeuron(
      {required BigInt neuronId,
      required BigInt dissolveDelaySeconds,
      required BigInt doms});

  Future<void> makeMotionProposal(
      {required BigInt neuronId,
      required String url,
      required String text,
      required String summary});

}

