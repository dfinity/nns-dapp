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
    return Neuron(
      address: fields[1] as String,
      durationRemaining: fields[6] as String,
      timerIsActive: fields[3] as bool,
      rewardAmount: fields[4] as double,
    )..domsBalance = fields[5] as String;
  }

  @override
  void write(BinaryWriter writer, Neuron obj) {
    writer
      ..writeByte(5)
      ..writeByte(1)
      ..write(obj.address)
      ..writeByte(6)
      ..write(obj.durationRemaining)
      ..writeByte(3)
      ..write(obj.timerIsActive)
      ..writeByte(4)
      ..write(obj.rewardAmount)
      ..writeByte(5)
      ..write(obj.domsBalance);
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
