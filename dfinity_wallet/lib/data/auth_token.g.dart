// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_token.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AuthTokenAdapter extends TypeAdapter<AuthToken> {
  @override
  final int typeId = 104;

  @override
  AuthToken read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AuthToken()
      ..creationDate = fields[0] as DateTime?
      ..data = fields[1] as String?
      ..key = fields[2] as String;
  }

  @override
  void write(BinaryWriter writer, AuthToken obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.creationDate)
      ..writeByte(1)
      ..write(obj.data)
      ..writeByte(2)
      ..write(obj.key);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthTokenAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
