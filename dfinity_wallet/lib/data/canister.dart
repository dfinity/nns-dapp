import 'dart:math';

import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

import 'dfinity_entity.dart';


class Canister extends DfinityEntity {
  final String name;
  final String publicKey;
  String? cyclesBalance;
  String? controller;

  bool? userIsController;

  @override
  String get identifier => publicKey;

  Canister(
      {required this.name, required this.publicKey, this.controller, required this.userIsController});
}
