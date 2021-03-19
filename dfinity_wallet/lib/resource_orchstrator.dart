import 'package:dfinity_wallet/dfinity.dart';
import 'service/hive_coordinator.dart';

class ResourceOrchestrator extends InheritedWidget {

  final HiveCoordinator hiveCoordinator;

  ResourceOrchestrator({
    Key? key,
    required Widget child,
    required this.hiveCoordinator
  }) :super(key: key,
      child: SigningService(child: HiveLoader(
          child: child, hiveCoordinator: hiveCoordinator)));

  static ResourceOrchestrator of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ResourceOrchestrator>()!;
  }

  @override
  bool updateShouldNotify(ResourceOrchestrator old) {
    return false;
  }
}
