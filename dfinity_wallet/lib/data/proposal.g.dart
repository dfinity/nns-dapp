// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProposalAdapter extends TypeAdapter<Proposal> {
  @override
  final int typeId = 5;

  @override
  Proposal read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Proposal(
      fields[0] as String,
      fields[1] as String,
      fields[2] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, Proposal obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.authorAddress)
      ..writeByte(2)
      ..write(obj.closeDate);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProposalAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
