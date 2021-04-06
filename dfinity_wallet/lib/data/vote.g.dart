// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vote.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class VoteAdapter extends TypeAdapter<Vote> {
  @override
  final int typeId = 10;

  @override
  Vote read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return Vote.UNSPECIFIED;
      case 1:
        return Vote.YES;
      case 2:
        return Vote.NO;
      default:
        return Vote.UNSPECIFIED;
    }
  }

  @override
  void write(BinaryWriter writer, Vote obj) {
    switch (obj) {
      case Vote.UNSPECIFIED:
        writer.writeByte(0);
        break;
      case Vote.YES:
        writer.writeByte(1);
        break;
      case Vote.NO:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VoteAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
