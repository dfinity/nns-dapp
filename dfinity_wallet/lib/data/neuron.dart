import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:hive/hive.dart';
import 'dfinity_entity.dart';
import 'followee.dart';
import 'neuron_state.dart';
import 'data_type_extensions.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron extends DfinityEntity with ICPSource {
  @HiveField(1)
  late String id;
  @HiveField(2)
  late List<BallotInfo> recentBallots;
  @HiveField(3)
  late String createdTimestampSeconds;
  @HiveField(4)
  late String votingPower;
  @HiveField(5)
  late NeuronState state;
  @HiveField(6)
  late String dissolveDelaySeconds;
  @HiveField(7)
  late String cachedNeuronStakeDoms;
  @HiveField(8)
  late String neuronFeesDoms;
  @HiveField(9)
  late String maturityDomsEquivalent;
  @HiveField(10)
  late String? whenDissolvedTimestampSeconds;
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

  BigInt get stake => cachedNeuronStakeDoms.toBigInt - neuronFeesDoms.toBigInt;

  @override
  String get balance => stake.toString();

  DateTime get whenDissolvedTimestamp =>
      DateTime.fromMillisecondsSinceEpoch(whenDissolvedTimestampSeconds!.toBigInt.toInt() * 1000);

  Duration get durationRemaining => whenDissolvedTimestamp.difference(DateTime.now());
}


