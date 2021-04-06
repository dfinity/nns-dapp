import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:hive/hive.dart';
import 'dfinity_entity.dart';
import 'followee.dart';
import 'neuron_state.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron extends DfinityEntity with ICPSource {
  @HiveField(1)
  late BigInt id;
  @HiveField(2)
  late List<BallotInfo> recentBallots;
  @HiveField(3)
  late BigInt createdTimestampSeconds;
  @HiveField(4)
  late BigInt votingPower;
  @HiveField(5)
  late NeuronState state;
  @HiveField(6)
  late BigInt dissolveDelaySeconds;
  @HiveField(7)
  late BigInt cachedNeuronStakeDoms;
  @HiveField(8)
  late BigInt neuronFeesDoms;
  @HiveField(9)
  late BigInt maturityDomsEquivalent;
  @HiveField(10)
  late BigInt? whenDissolvedTimestampSeconds;
  @HiveField(11)
  late List<Followee> followees;

  Neuron({
    required this.id,
    required this.recentBallots,
    required this.createdTimestampSeconds,
    required this.votingPower,
    required this.state,
    required this.dissolveDelaySeconds,
    required this.cachedNeuronStakeDoms,
  });

  Neuron.empty();

  @override
  String get identifier => id.toString();

  @override
  String get address => id.toString();

  @override
  int? get subAccountId => null;

  BigInt get stake => cachedNeuronStakeDoms - neuronFeesDoms;

  @override
  BigInt get balance => stake;

  DateTime get whenDissolvedTimestamp =>
      DateTime.fromMillisecondsSinceEpoch(
          (whenDissolvedTimestampSeconds!).toInt() * 1000);

  Duration get durationRemaining => whenDissolvedTimestamp.difference(DateTime.now());
}


