// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'canister.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CanisterAdapter extends TypeAdapter<Canister> {
  @override
  final int typeId = 102;

  @override
  Canister read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Canister(
      name: fields[0] as String,
      publicKey: fields[1] as String,
      controller: fields[4] as String?,
      userIsController: fields[8] as bool?,
    )..cyclesBalance = fields[3] as String?;
  }

  @override
  void write(BinaryWriter writer, Canister obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.publicKey)
      ..writeByte(3)
      ..write(obj.cyclesBalance)
      ..writeByte(4)
      ..write(obj.controller)
      ..writeByte(8)
      ..write(obj.userIsController);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CanisterAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
