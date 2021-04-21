// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal_status.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProposalStatusAdapter extends TypeAdapter<ProposalStatus> {
  @override
  final int typeId = 113;

  @override
  ProposalStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return ProposalStatus.Unknown;
      case 1:
        return ProposalStatus.Open;
      case 2:
        return ProposalStatus.Rejected;
      case 3:
        return ProposalStatus.Accepted;
      case 4:
        return ProposalStatus.Executed;
      case 5:
        return ProposalStatus.Failed;
      default:
        return ProposalStatus.Unknown;
    }
  }

  @override
  void write(BinaryWriter writer, ProposalStatus obj) {
    switch (obj) {
      case ProposalStatus.Unknown:
        writer.writeByte(0);
        break;
      case ProposalStatus.Open:
        writer.writeByte(1);
        break;
      case ProposalStatus.Rejected:
        writer.writeByte(2);
        break;
      case ProposalStatus.Accepted:
        writer.writeByte(3);
        break;
      case ProposalStatus.Executed:
        writer.writeByte(4);
        break;
      case ProposalStatus.Failed:
        writer.writeByte(5);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProposalStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
