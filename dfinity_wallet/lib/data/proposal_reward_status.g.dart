// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal_reward_status.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProposalRewardStatusAdapter extends TypeAdapter<ProposalRewardStatus> {
  @override
  final int typeId = 112;

  @override
  ProposalRewardStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return ProposalRewardStatus.Unknown;
      case 1:
        return ProposalRewardStatus.AcceptVotes;
      case 2:
        return ProposalRewardStatus.ReadyToSettle;
      case 3:
        return ProposalRewardStatus.Settled;
      case 4:
        return ProposalRewardStatus.Ineligible;
      default:
        return ProposalRewardStatus.Unknown;
    }
  }

  @override
  void write(BinaryWriter writer, ProposalRewardStatus obj) {
    switch (obj) {
      case ProposalRewardStatus.Unknown:
        writer.writeByte(0);
        break;
      case ProposalRewardStatus.AcceptVotes:
        writer.writeByte(1);
        break;
      case ProposalRewardStatus.ReadyToSettle:
        writer.writeByte(2);
        break;
      case ProposalRewardStatus.Settled:
        writer.writeByte(3);
        break;
      case ProposalRewardStatus.Ineligible:
        writer.writeByte(4);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProposalRewardStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
