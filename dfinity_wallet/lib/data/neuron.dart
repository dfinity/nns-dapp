import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:hive/hive.dart';
import 'dfinity_entity.dart';
import 'followee.dart';

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
  BigInt? get subAccountId => null;

  BigInt get stake => cachedNeuronStakeDoms - neuronFeesDoms;

  @override
  BigInt get balance => stake;
}


@HiveType(typeId: 8)
enum NeuronState {
  @HiveField(0)
  UNSPECIFIED,
  @HiveField(1)
  DISPERSING,
  @HiveField(2)
  LOCKED,
  @HiveField(3)
  UNLOCKED
}

extension NeuronStateDescription on NeuronState {
  String get description {
    switch (this) {
      case NeuronState.UNSPECIFIED:
        return "Unspecified";
      case NeuronState.DISPERSING:
        return "Dispersing";
      case NeuronState.LOCKED:
        return "Locked";
      case NeuronState.UNLOCKED:
        return "Locked";
    }
  }
}
