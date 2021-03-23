import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:hive/hive.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron extends HiveObject with ICPSource {
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
  late double stake;

  Neuron({
     this.name = "",
     this.address = "",
     this.durationRemaining = 0,
     this.timerIsActive = false,
     this.rewardAmount = 0,
     this.stake = 0,
  });

  NeuronState get state {
    if(timerIsActive){
      if(durationRemaining == 0) {
        return NeuronState.UNLOCKED;
      }else{
        return NeuronState.DISPERSING;
      }
    }else{
      return NeuronState.LOCKED;
    }
  }

  @override
  double get balance => stake;
}


enum NeuronState {
  DISPERSING, LOCKED, UNLOCKED
}