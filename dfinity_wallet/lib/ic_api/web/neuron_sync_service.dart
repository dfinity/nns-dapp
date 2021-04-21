import 'dart:js_util';

import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/followee.dart';
import 'package:dfinity_wallet/data/neuron_state.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';

import '../../dfinity.dart';
import 'governance_api.dart';
import 'js_utils.dart';
import 'dart:convert';
import 'stringify.dart';


class NeuronSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  NeuronSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchNeurons() async {
    dynamic res = (await promiseToFuture(governanceApi.getNeurons()));
    final string = stringify(res);
    dynamic response = jsonDecode(string);

    print("Storing ${response.length} neurons");
    response.forEach((e) {
      storeNeuron(e);
    });
  }

  void storeNeuron(dynamic e) {
    final neuronId = e['neuronId'].toString();
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

  void updateNeuron(Neuron neuron, String neuronId, dynamic res) {

    PrettyPrint.prettyPrintJson("neuron response", res);
    neuron.id = neuronId;
    neuron.votingPower = res['votingPower'].toString();
    neuron.state = NeuronState.values[res['state'].toInt()];
    neuron.dissolveDelaySeconds = res['dissolveDelaySeconds'].toString();

    final fullNeuron = res['fullNeuron'];
    final dissolveState = fullNeuron['dissolveState'];
    if (dissolveState != null) {
      neuron.whenDissolvedTimestampSeconds =
          dissolveState['WhenDissolvedTimestampSeconds']?.toString();
    }
    neuron.cachedNeuronStakeDoms =
        fullNeuron['cachedNeuronStake'].toString();
    neuron.recentBallots = parseRecentBallots(fullNeuron['recentBallots']);
    neuron.neuronFeesDoms = fullNeuron['neuronFees'].toString();
    neuron.maturityE8sEquivalent =
        fullNeuron['maturityE8sEquivalent'].toString();
    neuron.createdTimestampSeconds =
        fullNeuron['createdTimestampSeconds'].toString();
    neuron.followees = parseFollowees(fullNeuron['followees']);


    assert(neuron.id != null);
    assert(neuron.recentBallots != null);
    assert(neuron.createdTimestampSeconds != null);
    assert(neuron.votingPower != null);
    assert(neuron.state != null);
    assert(neuron.dissolveDelaySeconds != null);
    assert(neuron.cachedNeuronStakeDoms != null);
    assert(neuron.neuronFeesDoms != null);
    assert(neuron.maturityE8sEquivalent != null);
    assert(neuron.followees != null);
  }

  List<BallotInfo> parseRecentBallots(List<dynamic> recentBallots) =>
      [
        ...recentBallots.map((e) {
          return BallotInfo()
            ..proposalId = e['proposalId'].toString()
            ..vote = Vote.values[e['vote'].toInt()];
        })
      ];

  List<Followee> parseFollowees(List<dynamic> folowees) {
    final map = folowees.associate((e) =>
        MapEntry(Topic.values[e['topic'] as int],
            (e['followees'] as List<dynamic>).cast<String>()));

    return Topic.values
        .mapToList((e) => Followee()
        ..topic = e
        ..followees = map[e] ?? []);
  }
}

class PrettyPrint {
  static prettyPrintJson(String text, dynamic object){
    JsonEncoder encoder = new JsonEncoder.withIndent('  ');
    String prettyprint = encoder.convert(object);
    print("${text} $prettyprint");;
  }
}

