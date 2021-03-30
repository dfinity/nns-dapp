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
      fields[3] as String,
      fields[4] as String,
      fields[5] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Proposal obj) {
    writer
      ..writeByte(3)
      ..writeByte(3)
      ..write(obj.id)
      ..writeByte(4)
      ..write(obj.text)
      ..writeByte(5)
      ..write(obj.url);
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
