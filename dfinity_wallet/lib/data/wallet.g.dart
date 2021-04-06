// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class WalletAdapter extends TypeAdapter<Wallet> {
  @override
  final int typeId = 1;

  @override
  Wallet read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Wallet(
      fields[0] as String,
      fields[1] as String,
      fields[2] as bool,
      fields[3] as BigInt,
      fields[7] as BigInt?,
      (fields[4] as List).cast<Transaction>(),
    );
  }

  @override
  void write(BinaryWriter writer, Wallet obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.accountIdentifier)
      ..writeByte(2)
      ..write(obj.primary)
      ..writeByte(3)
      ..write(obj.balance)
      ..writeByte(4)
      ..write(obj.transactions)
      ..writeByte(7)
      ..write(obj.subAccountId);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is WalletAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
