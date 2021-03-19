import 'package:dfinity_wallet/resource_orchstrator.dart';
import 'package:dfinity_wallet/service/hive_coordinator.dart';
import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';

import 'dfinity.dart';

const String SplashPath = '/splash';
const String HomePath = '/home';
const String WalletDetailPath = '/wallet';

class PageConfig {
  final String path;
  String get key => path.replaceAll("/", "");
  final Widget Function() createWidget;

  final PageConfig? requiredParent;

  const PageConfig(
      {required this.path, required this.createWidget, this.requiredParent});
}

PageConfig SplashPageConfiguration = PageConfig(
    path: SplashPath, createWidget: () => SplashPage());

PageConfig HomeTabsPageConfiguration = PageConfig(
    path: HomePath, createWidget: () => HomePage());

class WalletRouterDelegate extends RouterDelegate<PageConfig>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<PageConfig> {

  List<Page> _pages = [];
  HiveCoordinator hiveCoordinator;

  WalletRouterDelegate(this.hiveCoordinator);

  @override
  PageConfig get currentConfiguration =>
      _pages.last.arguments as PageConfig;

  @override
  GlobalKey<NavigatorState> get navigatorKey => GlobalKey<NavigatorState>();


  @override
  Widget build(BuildContext context) {
    print("pages ${_pages.mapToList((e) => e.name)}");
    if(_pages.isEmpty){
      _addPage(SplashPageConfiguration);
    }

    return Navigator(
      key: navigatorKey,
      onPopPage: _onPopPage,
      pages: List.of(_pages),
      transitionDelegate: DefaultTransitionDelegate(),
    );
  }

  @override
  Future<void> setNewRoutePath(PageConfig configuration)  {
    print("setNewRoutePath ${configuration.path}");
    addPage(configuration);
    return Future.value();
  }

  bool _onPopPage(Route<dynamic> route, result) {
    print("_onPopPage");

    // 1
    final didPop = route.didPop(result);
    if (!didPop) {
      return false;
    }
    // 2
    _pages.remove(route.settings);
    // 3
    notifyListeners();

    return true;
  }

  void addPage(PageConfig pageConfig) {
    final shouldAddPage = _pages.isEmpty ||
        (_pages.last.arguments as PageConfig).key != pageConfig.key;

    if (shouldAddPage != false) {
      _addPage(pageConfig);
    }

    notifyListeners();
  }

  void _addPage(PageConfig pageConfig) {

    final requiredParent = pageConfig.requiredParent;
    if(requiredParent!=null){
      _addPage(requiredParent);
    }

    _pages.add(createPage(pageConfig));
  }

  MaterialPage createPage(PageConfig pageConfig) {
    return MaterialPage(
      child: RouterDelegateWidget(
          delegate: this,
          child: ResourceOrchestrator(hiveCoordinator: hiveCoordinator, child: pageConfig.createWidget())),
      key: ValueKey(pageConfig.key),
      name: pageConfig.path,
      arguments: pageConfig);
  }

  void replace(PageConfig newRoute) {
    if (_pages.isNotEmpty) {
      _pages.removeLast();
    }
    addPage(newRoute);
  }

  void setPath(List<MaterialPage> path) {
    _pages.clear();
    _pages.addAll(path);
    notifyListeners();
  }

  void replaceAll(PageConfig newRoute) {
    setNewRoutePath(newRoute);
  }

  void push(PageConfig newRoute) {
    addPage(newRoute);
  }

  void pushWidget(Widget child, PageConfig newRoute) {
    _addPage(newRoute);
    notifyListeners();
  }
}

class RouterDelegateWidget extends InheritedWidget {
  final WalletRouterDelegate delegate;

  const RouterDelegateWidget({
    Key? key,
    required this.delegate,
    required Widget child,
  })   : assert(child != null),
        super(key: key, child: child);

  static RouterDelegateWidget of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<RouterDelegateWidget>()!;
  }

  @override
  bool updateShouldNotify(RouterDelegateWidget old) {
    return false;
  }
}

extension DelegateNavigation on BuildContext {
  WalletRouterDelegate get nav => RouterDelegateWidget.of(this).delegate;
}
