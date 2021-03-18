
import 'package:hive/hive.dart';

part 'neuron.g.dart';

@HiveType(typeId: 3)
class Neuron {
  @HiveField(0)
  late double durationRemaining;
  @HiveField(1)
  late bool timerIsActive;
  @HiveField(2)
  late double rewardAmount;
}