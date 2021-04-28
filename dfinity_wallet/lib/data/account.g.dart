// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AccountAdapter extends TypeAdapter<Account> {
  @override
  final int typeId = 101;

  @override
  Account read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Account(
      fields[0] as String,
      fields[1] as String,
      fields[2] as bool,
      fields[3] as String,
      fields[5] as int?,
      (fields[4] as List).cast<Transaction>(),
      (fields[6] as HiveList?)?.castHiveList(),
      fields[7] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, Account obj) {
    writer
      ..writeByte(8)
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
      ..writeByte(5)
      ..write(obj.subAccountId)
      ..writeByte(6)
      ..write(obj.neurons)
      ..writeByte(7)
      ..write(obj.hardwareWallet);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AccountAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
