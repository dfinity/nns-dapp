import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:hive/hive.dart';
import 'dfinity_entity.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron extends DfinityEntity with ICPSource {
  @HiveField(0)
  late String name;
  @HiveField(1)
  late String address;
  @HiveField(2)
  late double durationRemaining;
  @HiveField(3)
  late bool timerIsActive;
  @HiveField(4)
  late double rewardAmount;
  @HiveField(5)
  late String domsBalance;

  Neuron({
    this.name = "",
    this.address = "",
    this.durationRemaining = 0,
    this.timerIsActive = false,
    this.rewardAmount = 0,
    double icpBalance = 0.0,
  }){
    this.icpBalance = icpBalance;
  }

  NeuronState get state {
    if (timerIsActive) {
      if (durationRemaining == 0) {
        return NeuronState.UNLOCKED;
      } else {
        return NeuronState.DISPERSING;
      }
    } else {
      return NeuronState.LOCKED;
    }
  }

  @override
  String get identifier => address;
}

enum NeuronState { DISPERSING, LOCKED, UNLOCKED }

extension NeuronStateDescription on NeuronState {
  String get description {
    switch (this) {
      case NeuronState.DISPERSING:
        return "Dispersing";
      case NeuronState.LOCKED:
        return "Locked";
      case NeuronState.UNLOCKED:
        return "Locked";
    }
  }
}
