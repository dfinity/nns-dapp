// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'neuron_state.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class NeuronStateAdapter extends TypeAdapter<NeuronState> {
  @override
  final int typeId = 8;

  @override
  NeuronState read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return NeuronState.UNSPECIFIED;
      case 1:
        return NeuronState.DISPERSING;
      case 2:
        return NeuronState.LOCKED;
      case 3:
        return NeuronState.UNLOCKED;
      default:
        return NeuronState.UNSPECIFIED;
    }
  }

  @override
  void write(BinaryWriter writer, NeuronState obj) {
    switch (obj) {
      case NeuronState.UNSPECIFIED:
        writer.writeByte(0);
        break;
      case NeuronState.DISPERSING:
        writer.writeByte(1);
        break;
      case NeuronState.LOCKED:
        writer.writeByte(2);
        break;
      case NeuronState.UNLOCKED:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NeuronStateAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
