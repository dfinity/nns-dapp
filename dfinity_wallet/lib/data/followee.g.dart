// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'followee.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class FolloweeAdapter extends TypeAdapter<Followee> {
  @override
  final int typeId = 12;

  @override
  Followee read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Followee()
      ..topic = fields[0] as Topic
      ..followees = (fields[1] as List).cast<String>();
  }

  @override
  void write(BinaryWriter writer, Followee obj) {
    writer
      ..writeByte(2)
      ..writeByte(0)
      ..write(obj.topic)
      ..writeByte(1)
      ..write(obj.followees);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FolloweeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
