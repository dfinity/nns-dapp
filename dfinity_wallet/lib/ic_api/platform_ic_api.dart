import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';

import '../dfinity.dart';

abstract class AbstractPlatformICApi extends State<ICApiManager> {
  void authenticate(BuildContext context);

  Future<void> buildServices(BuildContext context);

  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms});

  Future<void> createSubAccount({required String name});

  Future<void> sendICPTs(
      {required String toAccount,
      required BigInt doms,
      String? fromSubAccount});

  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      required BigInt dissolveDelayInSecs,
      String? fromSubAccount});

  Future<void> startDissolving({required BigInt neuronId});

  Future<void> stopDissolving({required BigInt neuronId});

  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required BigInt additionalDissolveDelaySeconds});

  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required BigInt followee});

  Future<void> registerVote(
      {required BigInt neuronId,
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

  @override
  Widget build(BuildContext context) {
    return InternetComputerApiWidget(child: widget.child, icApi: this);
  }
}

