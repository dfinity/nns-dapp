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
      creationDate: fields[2] as DateTime?,
      cyclesAdded: fields[3] as int,
      controller: fields[4] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Canister obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.publicKey)
      ..writeByte(2)
      ..write(obj.creationDate)
      ..writeByte(3)
      ..write(obj.cyclesAdded)
      ..writeByte(4)
      ..write(obj.controller);
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
