// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProposalAdapter extends TypeAdapter<Proposal> {
  @override
  final int typeId = 105;

  @override
  Proposal read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Proposal(
      fields[1] as String,
      fields[2] as String,
      fields[3] as String,
      fields[4] as String,
      fields[6] as int,
      fields[7] as int,
      fields[9] as String?,
      fields[10] as String?,
      fields[11] as String?,
      fields[12] as String?,
      fields[13] as DateTime?,
      fields[14] as Topic,
      fields[15] as ProposalStatus,
      fields[16] as ProposalRewardStatus,
      fields[17] as String,
    )..action = (fields[8] as Map).cast<String, dynamic>();
  }

  @override
  void write(BinaryWriter writer, Proposal obj) {
    writer
      ..writeByte(16)
      ..writeByte(1)
      ..write(obj.id)
      ..writeByte(2)
      ..write(obj.summary)
      ..writeByte(3)
      ..write(obj.url)
      ..writeByte(4)
      ..write(obj.proposer)
      ..writeByte(6)
      ..write(obj.no)
      ..writeByte(7)
      ..write(obj.yes)
      ..writeByte(8)
      ..write(obj.action)
      ..writeByte(9)
      ..write(obj.executedTimestampSeconds)
      ..writeByte(10)
      ..write(obj.failedTimestampSeconds)
      ..writeByte(11)
      ..write(obj.decidedTimestampSeconds)
      ..writeByte(12)
      ..write(obj.proposalTimestampSeconds)
      ..writeByte(13)
      ..write(obj.cacheUpdateDate)
      ..writeByte(14)
      ..write(obj.topic)
      ..writeByte(15)
      ..write(obj.status)
      ..writeByte(16)
      ..write(obj.rewardStatus)
      ..writeByte(17)
      ..write(obj.raw);
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
