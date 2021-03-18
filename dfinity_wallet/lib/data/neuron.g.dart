// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'neuron.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class NeuronAdapter extends TypeAdapter<Neuron> {
  @override
  final int typeId = 3;

  @override
  Neuron read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Neuron()
      ..durationRemaining = fields[0] as double
      ..timerIsActive = fields[1] as bool
      ..rewardAmount = fields[2] as double;
  }

  @override
  void write(BinaryWriter writer, Neuron obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.durationRemaining)
      ..writeByte(1)
      ..write(obj.timerIsActive)
      ..writeByte(2)
      ..write(obj.rewardAmount);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NeuronAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
