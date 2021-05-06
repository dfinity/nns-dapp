import 'dart:math';

import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

import 'dfinity_entity.dart';

part 'canister.g.dart';

@HiveType(typeId: 102)
class Canister extends DfinityEntity {
  @HiveField(0)
  final String name;
  @HiveField(1)
  final String publicKey;
  @HiveField(3)
  String? cyclesBalance;
  @HiveField(4)
  String? controller;

  @HiveField(8)
  bool? userIsController;

  @override
  String get identifier => publicKey;

  Canister(
      {required this.name, required this.publicKey, this.controller, required this.userIsController});
}
