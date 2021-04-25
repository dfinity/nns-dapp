import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

import '../dfinity.dart';

class PlatformICApi extends AbstractPlatformICApi {
  PlatformICApi(HiveBoxesWidget hiveBoxes) : super(hiveBoxes);

  @override
  void authenticate(BuildContext context) {
    throw UnimplementedError();
  }

  Future<void> buildServices() async {}

  @override
  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms}) {
    // TODO: implement acquireICPTs
    throw UnimplementedError();
  }

  @override
  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      int? fromSubAccount}) {
    // TODO: implement createNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> createSubAccount({required String name}) {
    // TODO: implement createSubAccount
    throw UnimplementedError();
  }

  @override
  Future<void> disburse(
      {required BigInt neuronId,
      required BigInt doms,
        required String toAccountId}) {
    // TODO: implement disburse
    throw UnimplementedError();
  }

  @override
  Future<void> disburseToNeuron(
      {required BigInt neuronId,
      required BigInt dissolveDelaySeconds,
      required BigInt doms}) {
    // TODO: implement disburseToNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> follow(
      {required BigInt neuronId,
      required Topic topic,
      required List<BigInt> followees}) {
    // TODO: implement follow
    throw UnimplementedError();
  }

  @override
  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required int additionalDissolveDelaySeconds}) {
    // TODO: implement increaseDissolveDelay
    throw UnimplementedError();
  }

  @override
  Future<void> makeMotionProposal(
      {required BigInt neuronId,
      required String url,
      required String text,
      required String summary}) {
    // TODO: implement makeMotionProposal
    throw UnimplementedError();
  }

  @override
  Future<void> registerVote(
      {required List<BigInt> neuronIds,
      required BigInt proposalId,
      required Vote vote}) {
    // TODO: implement registerVote
    throw UnimplementedError();
  }

  @override
  Future<void> sendICPTs(
      {required String toAccount, required BigInt doms, int? fromSubAccount}) {
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

  @override
  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
      required List<ProposalRewardStatus> includeRewardStatus,
      Proposal? beforeProposal}) {
    // TODO: implement fetchProposals
    throw UnimplementedError();
  }

  @override
  Future<Neuron> getNeuron({required BigInt neuronId}) {
    // TODO: implement getNeuron
    throw UnimplementedError();
  }

  @override
  Future<void> createDummyProposals({required BigInt neuronId}) {
    // TODO: implement createDummyProposals
    throw UnimplementedError();
  }
}
