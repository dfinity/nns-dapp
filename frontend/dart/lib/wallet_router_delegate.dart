import 'package:nns_dapp/resource_orchstrator.dart';
import 'package:observable/observable.dart' hide ChangeNotifier;

import 'nns_dapp.dart';
import 'ic_api/platform_ic_api.dart';
import 'resources_loading_page.dart';
import 'ui/canisters/canister_detail_widget.dart';
import 'ui/home/auth_widget.dart';
import 'ui/home/home_tabs_widget.dart';
import 'ui/home/landing_widget.dart';
import 'ui/neuron_info/neuron_info_widget.dart';
import 'ui/neurons/detail/neuron_detail_widget.dart';
import 'ui/proposals/proposal_detail_widget.dart';
import 'ui/wallet/account_detail_widget.dart';

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

StaticPage authPage = StaticPage('/auth', AuthWidget());

PageConfig loadingPage = StaticPage('/loading', LandingPageWidget());

PageConfig accountsTabPage = StaticPage(
    '/accounts',
    HomePage(
      initialTabIndex: 0,
    ),
    clearStack: true);

PageConfig neuronTabsPage = StaticPage(
    '/neurons',
    HomePage(
      initialTabIndex: 1,
    ),
    clearStack: true);

PageConfig proposalsTabPage = StaticPage(
    '/proposals',
    HomePage(
      initialTabIndex: 2,
    ),
    clearStack: true);

PageConfig canistersTabPage = StaticPage(
    '/canisters',
    HomePage(
      initialTabIndex: 3,
    ),
    clearStack: true);

class ApiObjectPage {
  final String pathTemplate;
  final Widget Function(String identifier) createWidget;

  ApiObjectPage(this.pathTemplate, this.createWidget);

  EntityPage createPageConfig(String identifier) {
    return EntityPage("$pathTemplate/$identifier",
        widget: createWidget(identifier),
        clearStack: false,
        requiredParent: null);
  }
}

ApiObjectPage neuronInfoPage =
    ApiObjectPage("/neuron_info", (identifier) => NeuronInfoWidget(identifier));

class EntityPageDefinition<T extends NnsDappEntity> {
  final ObservableMap<String, T> Function(HiveBoxes boxes) fetchBox;
  final Widget Function(T entity) createWidget;
  final String pathTemplate;
  final PageConfig parentPage;
  final Future<T?> Function(String identifier, AbstractPlatformICApi icApi)?
      entityFromIC;

  EntityPageDefinition(
      {required this.pathTemplate,
      required this.parentPage,
      required this.createWidget,
      required this.fetchBox,
      this.entityFromIC});

  T? entityForIdentifier(String entityIdentifier, HiveBoxes boxes) {
    return fetchBox(boxes)[entityIdentifier];
  }

  EntityPage createConfigWithEntity(T entity) {
    return createPageConfig(entity);
  }

  EntityPage createPageConfig(T entity) {
    return EntityPage("$pathTemplate/${entity.identifier}",
        widget: createWidget(entity),
        clearStack: false,
        requiredParent: parentPage);
  }
}

EntityPageDefinition accountPageDef = EntityPageDefinition<Account>(
    pathTemplate: "/wallet",
    parentPage: accountsTabPage,
    createWidget: (wallet) => AccountDetailPage(wallet),
    fetchBox: (boxes) => boxes.accounts);

EntityPageDefinition neuronPageDef = EntityPageDefinition<Neuron>(
    pathTemplate: "/neuron",
    parentPage: neuronTabsPage,
    createWidget: (neuron) => NeuronDetailWidget(neuron),
    fetchBox: (boxes) => boxes.neurons,
    entityFromIC: (neuronId, icApi) =>
        icApi.fetchNeuron(neuronId: BigInt.parse(neuronId)));

EntityPageDefinition proposalPageDef = EntityPageDefinition<Proposal>(
    pathTemplate: "/proposal",
    parentPage: proposalsTabPage,
    createWidget: (proposal) => ProposalDetailWidget(proposal),
    fetchBox: (boxes) => boxes.proposals,
    entityFromIC: (proposalId, icApi) =>
        icApi.fetchProposal(proposalId: BigInt.parse(proposalId)));

EntityPageDefinition canisterPageDef = EntityPageDefinition<Canister>(
    pathTemplate: "/canister",
    parentPage: canistersTabPage,
    createWidget: (canister) => CanisterDetailWidget(canister),
    fetchBox: (boxes) => boxes.canisters);

class WalletRouterDelegate extends RouterDelegate<PageConfig>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<PageConfig> {
  List<Page> _pages = [];
  HiveBoxes hiveBoxes;

  WalletRouterDelegate(this.hiveBoxes);

  @override
  PageConfig get currentConfiguration => _pages.last.arguments as PageConfig;

  @override
  GlobalKey<NavigatorState> get navigatorKey => GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    if (_pages.isEmpty) {
      _pages.add(createPage(loadingPage));
    }

    return ResourceOrchestrator(
      hiveBoxes: hiveBoxes,
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
    // print("setNewRoutePath ${configuration.path}");

    if (configuration is ResourcesLoadingPageConfig) {
      redirectWhenLoaded(configuration);
      addPage(loadingPage);
    } else {
      addPage(configuration);
    }

    return Future.value();
  }

  bool _onPopPage(Route<dynamic> route, result) {
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

    _pages.removeWhere((element) => element.arguments == loadingPage);

    if (shouldAddPage) {
      // print("adding page ${pageConfig.key}");

      _addPage(pageConfig);

      notifyListeners();
    } else {
      // print("not adding page ${pageConfig.key}");
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

  void redirectWhenLoaded(ResourcesLoadingPageConfig configuration) async {
    final isLoggedIn = await configuration.loadDestinationResources;
    if (isLoggedIn) {
      final destination = await configuration.destinationPage;
      push(destination);
    } else {
      if (configuration.logoutOnFailure) {
        await hiveBoxes.deleteAllData();
        push(authPage);
      }
    }
  }
}

class RouterDelegateWidget extends InheritedWidget {
  final WalletRouterDelegate delegate;

  const RouterDelegateWidget({
    Key? key,
    required this.delegate,
    required Widget child,
  }) : super(key: key, child: child);

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
