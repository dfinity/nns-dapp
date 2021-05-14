// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transaction.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TransactionAdapter extends TypeAdapter<Transaction> {
  @override
  final int typeId = 106;

  @override
  Transaction read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Transaction(
      from: fields[0] as String,
      to: fields[1] as String,
      doms: fields[2] as String,
      date: fields[3] as DateTime,
      fee: fields[4] as String,
      type: fields[5] as TransactionType,
      memo: fields[6] as BigInt,
      incomplete: fields[7] as String,
      blockHeight: fields[8] as BigInt,
    );
  }

  @override
  void write(BinaryWriter writer, Transaction obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.from)
      ..writeByte(1)
      ..write(obj.to)
      ..writeByte(2)
      ..write(obj.doms)
      ..writeByte(3)
      ..write(obj.date)
      ..writeByte(4)
      ..write(obj.fee)
      ..writeByte(5)
      ..write(obj.type)
      ..writeByte(6)
      ..write(obj.memo)
      ..writeByte(7)
      ..write(obj.incomplete)
      ..writeByte(8)
      ..write(obj.blockHeight);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TransactionAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
