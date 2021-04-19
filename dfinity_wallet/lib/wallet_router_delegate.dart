import 'package:dfinity_wallet/resource_orchstrator.dart';
import 'package:dfinity_wallet/resources_loading_page.dart';
import 'package:dfinity_wallet/ui/home/auth_widget.dart';
import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/home/landing_widget.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_detail_widget.dart';
import 'package:dfinity_wallet/ui/proposals/proposal_detail_widget.dart';
import 'package:dfinity_wallet/ui/wallet/account_detail_widget.dart';
import 'package:hive/hive.dart';

import 'dfinity.dart';

const String ProposalDetailPath = '/proposal';
const String CanisterTabsPath = '/canisters';
const String NeuronsTabsPath = '/neurons';

abstract class PageConfig {
  final String path;
  final bool clearStack;
  final PageConfig? requiredParent;

  String get key => path.replaceAll("/", "");

  Widget createWidget();

  void transformPageStack(List<Page> pages) {
    if (clearStack) pages.clear();
  }

  const PageConfig(this.path, {this.clearStack = false, this.requiredParent});
}

class StaticPage extends PageConfig {
  final Widget widget;

  StaticPage(String path, this.widget, {bool clearStack = false})
      : super(path, clearStack: clearStack);

  @override
  Widget createWidget() => widget;
}

class EntityPage extends PageConfig {
  final Widget widget;

  EntityPage(String path,
      {required this.widget,
      bool clearStack = false,
      PageConfig? requiredParent})
      : super(path, clearStack: clearStack, requiredParent: requiredParent);

  @override
  Widget createWidget() => widget;
}

StaticPage AuthPage = StaticPage('/auth', AuthWidget());

PageConfig LoadingPage = StaticPage('/loading', LandingPageWidget());

PageConfig AccountsTabPage = StaticPage(
    '/accounts',
    HomePage(
      initialTabIndex: 0,
    ),
    clearStack: true);

PageConfig NeuronTabsPage = StaticPage(
    '/neurons',
    HomePage(
      initialTabIndex: 1,
    ),
    clearStack: true);

PageConfig ProposalsTabPage = StaticPage(
    '/proposals',
    HomePage(
      initialTabIndex: 2,
    ),
    clearStack: true);

PageConfig CanistersTabPage = StaticPage(
    '/canisters',
    HomePage(
      initialTabIndex: 3,
    ),
    clearStack: true);

class EntityPageDefinition<T extends DfinityEntity> {
  final Box<T> Function(HiveBoxes boxes) fetchBox;
  final Widget Function(T entity) createWidget;
  final String pathTemplate;
  final PageConfig parentPage;

  EntityPageDefinition(
      this.pathTemplate, this.parentPage, this.createWidget, this.fetchBox);

  EntityPage createConfigWithId(String entityIdentifier, HiveBoxes boxes) {
    final entity = fetchBox(boxes).get(entityIdentifier);
    return createPageConfig(entity!);
  }

  EntityPage createPageConfig(T entity) {
    return EntityPage("$pathTemplate/${entity.identifier}",
        widget: createWidget(entity),
        clearStack: false,
        requiredParent: parentPage);
  }
}

EntityPageDefinition AccountPageDef = EntityPageDefinition<Account>(
    "/wallet",
    AccountsTabPage,
    (wallet) => AccountDetailPage(wallet),
    (boxes) => boxes.accounts!);

EntityPageDefinition NeuronPageDef = EntityPageDefinition<Neuron>(
    "/neuron",
    NeuronTabsPage,
    (neuron) => NeuronDetailWidget(neuron),
    (boxes) => boxes.neurons!);

EntityPageDefinition ProposalPageDef = EntityPageDefinition<Proposal>(
    "/proposal",
    ProposalsTabPage,
    (proposal) => ProposalDetailWidget(proposal),
    (boxes) => boxes.proposals!);

class WalletRouterDelegate extends RouterDelegate<PageConfig>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<PageConfig> {
  List<Page> _pages = [];
  HiveCoordinator hiveCoordinator;

  WalletRouterDelegate(this.hiveCoordinator);

  @override
  PageConfig get currentConfiguration => _pages.last.arguments as PageConfig;

  @override
  GlobalKey<NavigatorState> get navigatorKey => GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    if(_pages.isEmpty){
      _pages.add(createPage(LoadingPage));
    }

    return ResourceOrchestrator(
      hiveCoordinator: hiveCoordinator,
      child: Navigator(
        key: navigatorKey,
        onPopPage: _onPopPage,
        pages: List.of(_pages),
        transitionDelegate: DefaultTransitionDelegate(),
      ),
    );
  }

  @override
  Future<void> setNewRoutePath(PageConfig configuration) {
    print("setNewRoutePath ${configuration.path}");

    if(configuration is ResourcesLoadingPageConfig){
      redirectWhenLoaded(configuration as ResourcesLoadingPageConfig);
      addPage(LoadingPage);
    }else{
      addPage(configuration);
    }

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
    final lastKey = _pages.lastOrNull
        ?.takeIf((e) => (e is PageConfig))
        ?.let((e) => (e as PageConfig).key);
    final shouldAddPage = _pages.isEmpty || lastKey != pageConfig.key;

    _pages.removeWhere((element) => element.arguments == LoadingPage);

    if (shouldAddPage) {
      print("adding page ${pageConfig.key}");

      _addPage(pageConfig);

      notifyListeners();
    } else {
      print("not adding page ${pageConfig.key}");
    }
  }

  void _addPage(PageConfig pageConfig) {
    pageConfig.transformPageStack(_pages);
    if (pageConfig.requiredParent != null &&
        _pages.none((element) => element.key == ValueKey(pageConfig.key))) {
      _addPage(pageConfig.requiredParent!);
    }
    _pages.add(createPage(pageConfig));
  }

  MaterialPage createPage(PageConfig pageConfig) {
    return MaterialPage(
        child: RouterDelegateWidget(
            delegate: this,
            child: LoadingOverlayController(child: pageConfig.createWidget())),
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
    _pages.clear();
    _pages.add(createPage(newRoute));
    notifyListeners();
  }

  void push(PageConfig newRoute) {
    addPage(newRoute);
  }

  void pushWidget(Widget child, PageConfig newRoute) {
    _addPage(newRoute);
    notifyListeners();
  }

  void redirectWhenLoaded(ResourcesLoadingPageConfig configuration) async{
    final isLoggedIn = await configuration.hasValidAuthToken;
    if(isLoggedIn){
      final destination = await configuration.destinationPage;
      push(destination);
    }else{
      await hiveCoordinator.deleteAllData();
      push(AuthPage);
    }
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
