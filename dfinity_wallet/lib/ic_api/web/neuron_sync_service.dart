
import 'dart:js_util';

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
    print("Fetched neuron ${neuronId}");
    if (!hiveBoxes.neurons.containsKey(neuronId)) {
      hiveBoxes.neurons.put(
          neuronId,
          Neuron(
              address: neuronId,
              durationRemaining: e.dissolveDelaySeconds.toString(),
              timerIsActive: e.state == 2,
              rewardAmount: 0,
              icpBalance: e.votingPower.toString().toICPT));
    } else {
      final neuron = hiveBoxes.neurons.get(neuronId);
      neuron!.timerIsActive = e.state == 2;
      neuron.save();
    }
  }
}
