import 'package:dfinity_wallet/dfinity.dart';

class ResourceOrchestrator extends InheritedWidget {

  final HiveCoordinator hiveCoordinator;

  ResourceOrchestrator({
    Key? key,
    required Widget child,
    required this.hiveCoordinator
  }) :super(key: key,
      child: LoadingOverlayController(
        child: HiveLoader(
          hiveCoordinator: hiveCoordinator,
          child: ICApiManager(
            child: child,
          ),
        ),
      ));

  static ResourceOrchestrator of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ResourceOrchestrator>()!;
  }

  @override
  bool updateShouldNotify(ResourceOrchestrator old) {
    return false;
  }
}
