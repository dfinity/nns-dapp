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
      fields[9] as String,
      fields[6] as String,
      fields[7] as int,
      fields[8] as int,
    );
  }

  @override
  void write(BinaryWriter writer, Proposal obj) {
    writer
      ..writeByte(7)
      ..writeByte(3)
      ..write(obj.id)
      ..writeByte(4)
      ..write(obj.text)
      ..writeByte(5)
      ..write(obj.url)
      ..writeByte(9)
      ..write(obj.proposer)
      ..writeByte(6)
      ..write(obj.status)
      ..writeByte(7)
      ..write(obj.no)
      ..writeByte(8)
      ..write(obj.yes);
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
