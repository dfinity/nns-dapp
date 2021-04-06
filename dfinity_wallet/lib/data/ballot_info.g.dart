// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ballot_info.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class BallotInfoAdapter extends TypeAdapter<BallotInfo> {
  @override
  final int typeId = 9;

  @override
  BallotInfo read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return BallotInfo()
      ..vote = fields[0] as Vote
      ..proposalId = fields[1] as String;
  }

  @override
  void write(BinaryWriter writer, BallotInfo obj) {
    writer
      ..writeByte(2)
      ..writeByte(0)
      ..write(obj.vote)
      ..writeByte(1)
      ..write(obj.proposalId);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BallotInfoAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
