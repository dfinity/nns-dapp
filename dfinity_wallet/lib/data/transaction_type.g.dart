// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transaction_type.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TransactionTypeAdapter extends TypeAdapter<TransactionType> {
  @override
  final int typeId = 114;

  @override
  TransactionType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return TransactionType.Send;
      case 1:
        return TransactionType.Receive;
      case 2:
        return TransactionType.Mint;
      case 3:
        return TransactionType.Burn;
      case 4:
        return TransactionType.StakeNeuron;
      case 5:
        return TransactionType.StakeNeuronNotification;
      case 6:
        return TransactionType.CreateCanister;
      case 7:
        return TransactionType.CreateCanisterNotification;
      case 8:
        return TransactionType.TopUpCanister;
      case 9:
        return TransactionType.TopUpCanisterNotification;
      default:
        return TransactionType.Send;
    }
  }

  @override
  void write(BinaryWriter writer, TransactionType obj) {
    switch (obj) {
      case TransactionType.Send:
        writer.writeByte(0);
        break;
      case TransactionType.Receive:
        writer.writeByte(1);
        break;
      case TransactionType.Mint:
        writer.writeByte(2);
        break;
      case TransactionType.Burn:
        writer.writeByte(3);
        break;
      case TransactionType.StakeNeuron:
        writer.writeByte(4);
        break;
      case TransactionType.StakeNeuronNotification:
        writer.writeByte(5);
        break;
      case TransactionType.CreateCanister:
        writer.writeByte(6);
        break;
      case TransactionType.CreateCanisterNotification:
        writer.writeByte(7);
        break;
      case TransactionType.TopUpCanister:
        writer.writeByte(8);
        break;
      case TransactionType.TopUpCanisterNotification:
        writer.writeByte(9);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TransactionTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
