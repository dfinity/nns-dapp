import 'package:dfinity_wallet/data/setup/hive_coordinator.dart';
import 'package:hive/hive.dart';

abstract class DfinityEntity extends HiveObject {
  String get identifier;
  bool get isPending => identifier.startsWith(PENDING_OBJECT_KEY);
}