import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

class ResourceOrchestrator extends InheritedWidget {

  final HiveCoordinator hiveCoordinator;
  final AbstractPlatformICApi? icApi;

  ResourceOrchestrator({
    Key? key,
    required Widget child,
    required this.hiveCoordinator,
    this.icApi,
  }) :super(key: key,
      child: LoadingOverlayController(
        child: HiveLoader(
          hiveCoordinator: hiveCoordinator,
          child: ICApiManager(
            icApi: icApi,
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
