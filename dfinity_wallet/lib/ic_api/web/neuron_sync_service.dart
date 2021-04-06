import 'dart:js_util';

import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/followee.dart';
import 'package:dfinity_wallet/data/neuron_state.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';

import '../../dfinity.dart';
import 'governance_api.dart';

class NeuronSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  NeuronSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchNeurons() async {
    final response = await promiseToFuture(governanceApi.getNeurons());
    response.forEach((e) {
      storeNeuron(e);
    });
  }

  void storeNeuron(dynamic e) {
    final neuronId = e.neuronId.toString();
    if (!hiveBoxes.neurons.containsKey(neuronId)) {
      hiveBoxes.neurons.put(
          neuronId,
          Neuron.empty());
    }
    final neuron = hiveBoxes.neurons.get(neuronId)!;
    neuron.id = BigInt.parse(neuronId);
    neuron.recentBallots = parseRecentBallots(e.fullNeuron.recentBallots);
    neuron.createdTimestampSeconds = BigInt.from(e.fullNeuron.createdTimestampSeconds);
    neuron.votingPower = BigInt.from(e.votingPower);
    neuron.state = NeuronState.values[e.state.toString().toInt()];
    neuron.dissolveDelaySeconds = BigInt.from(e.dissolveDelaySeconds);
    neuron.cachedNeuronStakeDoms = BigInt.from(e.fullNeuron.cachedNeuronStakeDoms);
    neuron.neuronFeesDoms = BigInt.from(e.fullNeuron.neuronFeesDoms);
    neuron.maturityDomsEquivalent = BigInt.from(e.fullNeuron.maturityDomsEquivalent);
    neuron.whenDissolvedTimestampSeconds = BigInt.from(e.fullNeuron.dissolveState.whenDissolvedTimestampSeconds);
    neuron.followees = parseFollowees(e.fullNeuron.followees);
    neuron.save();
  }

  List<BallotInfo> parseRecentBallots(recentBallots) => [
      ...recentBallots.map((e) =>
      BallotInfo()
        ..proposalId = BigInt.from(e.proposalId)
        ..vote = Vote.values[e.vote.toInt()]
      )
    ];

  List<Followee> parseFollowees(recentBallots) => [
    ...recentBallots.map((e) =>
    Followee()
      ..followees = [...e.followees.map((e) => BigInt.from(e))]
      ..topic = Topic.values[e.vote.toInt()]
    )
  ];
}
