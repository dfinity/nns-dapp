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
      final neuron = Neuron.empty();
      updateNeuron(neuron, neuronId, e);
      hiveBoxes.neurons.put(neuronId, neuron);
    } else {
      final neuron = hiveBoxes.neurons.get(neuronId)!;
      updateNeuron(neuron, neuronId, e);
      neuron.save();
    }
  }

  void updateNeuron(Neuron neuron, String neuronId, e) {
    neuron.id = neuronId;
    neuron.recentBallots = parseRecentBallots(e.fullNeuron.recentBallots);
    neuron.createdTimestampSeconds =
        e.fullNeuron.createdTimestampSeconds.toString();
    neuron.votingPower = e.votingPower.toString();
    neuron.state = NeuronState.values[e.state.toString().toInt()];
    neuron.dissolveDelaySeconds = e.dissolveDelaySeconds.toString();
    neuron.cachedNeuronStakeDoms =
        e.fullNeuron.cachedNeuronStakeDoms.toString();
    neuron.neuronFeesDoms = e.fullNeuron.neuronFeesDoms.toString();
    neuron.maturityDomsEquivalent =
        e.fullNeuron.maturityDomsEquivalent.toString();
    neuron.whenDissolvedTimestampSeconds =
        e.fullNeuron.dissolveState.whenDissolvedTimestampSeconds.toString();
    neuron.followees = parseFollowees(e.fullNeuron.followees);
  }

  List<BallotInfo> parseRecentBallots(recentBallots) => [
        ...recentBallots.map((e) => BallotInfo()
          ..proposalId = e.proposalId.toString()
          ..vote = Vote.values[e.vote.toInt()])
      ];

  List<Followee> parseFollowees(recentBallots) => [
        ...recentBallots.map((e) => Followee()
          ..followees = [...e.followees.map((e) => BigInt.from(e))]
          ..topic = Topic.values[e.vote.toInt()])
      ];
}
