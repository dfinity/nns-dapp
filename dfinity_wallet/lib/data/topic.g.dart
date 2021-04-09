// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'topic.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TopicAdapter extends TypeAdapter<Topic> {
  @override
  final int typeId = 109;

  @override
  Topic read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return Topic.Unspecified;
      case 1:
        return Topic.ManageNeuron;
      case 2:
        return Topic.ExchangeRate;
      case 3:
        return Topic.NetworkEconomics;
      case 4:
        return Topic.Governance;
      case 5:
        return Topic.NodeAdmin;
      case 6:
        return Topic.ParticipantManagement;
      case 7:
        return Topic.SubnetManagement;
      case 8:
        return Topic.NetworkCanisterManagement;
      case 9:
        return Topic.Kyc;
      default:
        return Topic.Unspecified;
    }
  }

  @override
  void write(BinaryWriter writer, Topic obj) {
    switch (obj) {
      case Topic.Unspecified:
        writer.writeByte(0);
        break;
      case Topic.ManageNeuron:
        writer.writeByte(1);
        break;
      case Topic.ExchangeRate:
        writer.writeByte(2);
        break;
      case Topic.NetworkEconomics:
        writer.writeByte(3);
        break;
      case Topic.Governance:
        writer.writeByte(4);
        break;
      case Topic.NodeAdmin:
        writer.writeByte(5);
        break;
      case Topic.ParticipantManagement:
        writer.writeByte(6);
        break;
      case Topic.SubnetManagement:
        writer.writeByte(7);
        break;
      case Topic.NetworkCanisterManagement:
        writer.writeByte(8);
        break;
      case Topic.Kyc:
        writer.writeByte(9);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TopicAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
