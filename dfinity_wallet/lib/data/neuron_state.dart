import 'package:hive/hive.dart';

part 'neuron_state.g.dart';

@HiveType(typeId: 111)
enum NeuronState {
@HiveField(0)
UNSPECIFIED,
@HiveField(1)
LOCKED,
@HiveField(2)
DISSOLVING,
@HiveField(3)
UNLOCKED
}

extension NeuronStateDescription on NeuronState {
  String get description {
    switch (this) {
      case NeuronState.UNSPECIFIED:
        return "Unspecified";
      case NeuronState.DISSOLVING:
        return "Dissolving";
      case NeuronState.LOCKED:
        return "Locked";
      case NeuronState.UNLOCKED:
        return "Locked";
    }
  }
}
