import 'package:hive/hive.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron extends HiveObject {
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

  Neuron({
     this.name = "",
     this.address = "",
     this.durationRemaining = 0,
     this.timerIsActive = false,
     this.rewardAmount = 0,
  });
}
