import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ic_api/web/hardware_wallet_api.dart';
import 'package:dfinity_wallet/ic_api/web/neuron_sync_service.dart';

import '../dfinity.dart';

abstract class AbstractPlatformICApi {
  final HiveBoxesWidget hiveBoxes;


  AbstractPlatformICApi(this.hiveBoxes) {
    buildServices();
  }

  void authenticate(BuildContext context);

  Future<void> buildServices();
  Future<void> refreshAccounts();

  Future<void> acquireICPTs(
      {required String accountIdentifier, required BigInt doms});

  Future<void> createSubAccount({required String name});

  Future<void> sendICPTs(
      {required String toAccount, required BigInt doms, int? fromSubAccount});

  Future<void> createNeuron(
      {required BigInt stakeInDoms,
      int? fromSubAccount});

  Future<void> startDissolving({required BigInt neuronId});

  Future<void> stopDissolving({required BigInt neuronId});

  Future<void> increaseDissolveDelay(
      {required BigInt neuronId,
      required int additionalDissolveDelaySeconds});

  Future<Neuron> spawnNeuron({required BigInt neuronId});

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
      {required BigInt neuronId, required BigInt doms, required String toAccountId});


  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
        required List<ProposalRewardStatus> includeRewardStatus,
        Proposal? beforeProposal});

  Future<Proposal> fetchProposal({required BigInt proposalId});

  Future<Neuron> fetchNeuron({required BigInt neuronId});

  Future<NeuronInfo> fetchNeuronInfo({required BigInt neuronId});

  Future<void> createDummyProposals({required BigInt neuronId});



  Future<void> test();

  Future<dynamic> connectToHardwareWallet();
  Future<HardwareWalletApi> createHardwareWalletApi({dynamic ledgerIdentity});
  Future<void> registerHardwareWallet(
      {required String name, dynamic ledgerIdentity});

}


