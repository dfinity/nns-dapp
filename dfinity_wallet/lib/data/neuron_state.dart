import 'package:hive/hive.dart';

part 'neuron_state.g.dart';

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
