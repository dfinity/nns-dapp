import 'package:dfinity_wallet/data/setup/hive_coordinator.dart';
import 'package:hive/hive.dart';

abstract class DfinityEntity {
  String get identifier;
}