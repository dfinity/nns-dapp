import 'dart:js_util';

import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/followee.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/neuron_state.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/data/vote.dart';

import '../../dfinity.dart';
import 'service_api.dart';
import 'dart:convert';
import 'stringify.dart';

class NeuronSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  NeuronSyncService({required this.serviceApi, required this.hiveBoxes});

  Future<void> syncNeuron(String neuronId) async {
    dynamic res =
        (await promiseToFuture(serviceApi.getNeuron(neuronId.toBigInt.toJS)));
    final string = stringify(res);
    dynamic response = jsonDecode(string);
    storeNeuron(response);
  }

  Future<void> fetchNeurons() async {
    // print("fetching neurons");
    dynamic res = (await promiseToFuture(serviceApi.getNeurons()));
    final string = stringify(res);
    // print("fetched neurons $string");
    dynamic response = (jsonDecode(string) as List<dynamic>).toList();
    response.forEach((e) => storeNeuron(e));
  }

  Neuron storeNeuron(dynamic e) {
    final neuronId = e['neuronId'].toString();
    if (!hiveBoxes.neurons.containsKey(neuronId)) {
      final neuron = Neuron.empty();
      neuron.followEditCounter = 0;
      updateNeuron(neuron, neuronId, e);
      hiveBoxes.neurons[neuronId] = neuron;
      return neuron;
    } else {
      final neuron = hiveBoxes.neurons[neuronId]!;
      updateNeuron(neuron, neuronId, e);
      hiveBoxes.neurons[neuronId] = neuron;
      return neuron;
    }
    hiveBoxes.neurons.notifyChange();
  }

  void updateNeuron(Neuron neuron, String neuronId, dynamic res) {
    neuron.id = neuronId;
    neuron.votingPower = ICP.fromE8s(res['votingPower'].toString().toBigInt);
    neuron.state = NeuronState.values[res['state'].toInt()];
    neuron.dissolveDelaySeconds = res['dissolveDelaySeconds'].toString();

    final fullNeuron = res['fullNeuron'];
    if (fullNeuron != null) {
      parseFullNeuron(fullNeuron, neuron);
    }
    hiveBoxes.neurons.notifyChange();
  }

  void parseFullNeuron(dynamic fullNeuron, Neuron neuron) {
    final dissolveState = fullNeuron['dissolveState'];
    if (dissolveState != null) {
      neuron.whenDissolvedTimestampSeconds =
          dissolveState['WhenDissolvedTimestampSeconds']?.toString();
    }
    neuron.cachedNeuronStake =
        ICP.fromE8s(fullNeuron['cachedNeuronStake'].toString().toBigInt);
    neuron.recentBallots = parseRecentBallots(fullNeuron['recentBallots']);
    neuron.neuronFees =
        ICP.fromE8s(fullNeuron['neuronFees'].toString().toBigInt);
    neuron.maturityICPEquivalent =
        ICP.fromE8s(fullNeuron['maturityE8sEquivalent'].toString().toBigInt);
    neuron.createdTimestampSeconds =
        fullNeuron['createdTimestampSeconds'].toString();
    neuron.followees = parseFollowees(fullNeuron['followees']);
    neuron.isCurrentUserController = fullNeuron['isCurrentUserController'];
    neuron.accountIdentifier = fullNeuron['accountIdentifier'];
    neuron.hotkeys = fullNeuron['hotKeys'].cast<String>();
  }

  List<BallotInfo> parseRecentBallots(List<dynamic> recentBallots) => [
        ...recentBallots.map((e) {
          return BallotInfo()
            ..proposalId = e['proposalId'].toString()
            ..vote = Vote.values[e['vote'].toInt()];
        })
      ];

  List<Followee> parseFollowees(List<dynamic> folowees) {
    final map = folowees.associate((e) => MapEntry(
        Topic.values[e['topic'] as int],
        (e['followees'] as List<dynamic>).cast<String>()));

    return Topic.values.mapToList((e) => Followee()
      ..topic = e
      ..followees = map[e] ?? []);
  }
}

class PrettyPrint {
  static prettyPrintJson(String text, dynamic object) {
    JsonEncoder encoder = new JsonEncoder.withIndent('  ');
    String prettyprint = encoder.convert(object);
  }
}

class NeuronInfo extends DfinityEntity {
  final BigInt neuronId;
  final BigInt dissolveDelaySeconds;
  final List<BallotInfo> recentBallots;
  final BigInt createdTimestampSeconds;
  final NeuronState state;
  final BigInt retrievedAtTimestampSeconds;
  final ICP votingPower;
  final BigInt ageSeconds;

  static fromResponse(dynamic response) {
    final neuronId = response['neuronId'].toString().toBigInt;
    final dissolveDelaySeconds =
        response['dissolveDelaySeconds'].toString().toBigInt;
    final recentBallots = <BallotInfo>[
      ...response['recentBallots'].map((e) => BallotInfo()
        ..proposalId = e['proposalId'].toString()
        ..vote = Vote.values[e['vote'].toInt()])
    ];
    final createdTimestampSeconds =
        response['createdTimestampSeconds'].toString().toBigInt;
    final state = NeuronState.values[response['state'].toInt()];
    final retrievedAtTimestampSeconds =
        response['retrievedAtTimestampSeconds'].toString().toBigInt;
    final votingPower =
        ICP.fromE8s(response['votingPower'].toString().toBigInt);
    final ageSeconds = response['ageSeconds'].toString().toBigInt;

    final obj = NeuronInfo(
      neuronId: neuronId,
      dissolveDelaySeconds: dissolveDelaySeconds,
      recentBallots: recentBallots,
      createdTimestampSeconds: createdTimestampSeconds,
      state: state,
      retrievedAtTimestampSeconds: retrievedAtTimestampSeconds,
      votingPower: votingPower,
      ageSeconds: ageSeconds,
    );
    return obj;
  }

  NeuronInfo(
      {required this.neuronId,
      required this.dissolveDelaySeconds,
      required this.recentBallots,
      required this.createdTimestampSeconds,
      required this.state,
      required this.retrievedAtTimestampSeconds,
      required this.votingPower,
      required this.ageSeconds});

  @override
  String get identifier => neuronId.toString();
}
