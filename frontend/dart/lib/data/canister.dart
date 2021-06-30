import 'cycles.dart';
import 'dfinity_entity.dart';


class Canister extends DfinityEntity {
  final String name;
  final String publicKey;
  Cycles? cyclesBalance;
  List<String>? controllers;

  bool? userIsController;

  @override
  String get identifier => publicKey;

  Canister(
      {required this.name,
      required this.publicKey,
      this.controllers,
      required this.userIsController});
}
