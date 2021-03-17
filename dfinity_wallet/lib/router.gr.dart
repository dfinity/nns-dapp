// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouteGenerator
// **************************************************************************

import 'package:auto_route/auto_route.dart' as _i1;
import 'package:core/core.dart' as _i5;

import 'ui/home/home_page.dart' as _i2;
import 'ui/home/home_tabs_widget.dart' as _i3;
import 'ui/wallet/wallet_detail_widget.dart' as _i4;

class AppRouter extends _i1.RootStackRouter {
  AppRouter();

  @override
  final Map<String, _i1.PageFactory> pagesMap = {
    HomeRouteContainer.name: (entry) {
      var args = entry.routeData.argsAs<HomeRouteContainerArgs>(
          orElse: () => HomeRouteContainerArgs());
      return _i1.MaterialPageX(
          entry: entry,
          child: _i2.HomePageContainer(key: args.key),
          maintainState: true,
          fullscreenDialog: false);
    },
    HomeTabsWidget.name: (entry) {
      return _i1.CustomPage(
          entry: entry,
          child: _i3.HomeTabsWidget(),
          maintainState: true,
          fullscreenDialog: false,
          transitionsBuilder: _i1.TransitionsBuilders.fadeIn,
          opaque: true,
          barrierDismissible: false);
    },
    WalletDetailRoute.name: (entry) {
      var args = entry.routeData
          .argsAs<WalletDetailRouteArgs>(orElse: () => WalletDetailRouteArgs());
      var pathParams = entry.routeData.pathParams;
      return _i1.MaterialPageX(
          entry: entry,
          child: _i4.WalletDetailPage(
              walletAddress:
                  pathParams.optString('wallet_address', args.walletAddress)),
          maintainState: true,
          fullscreenDialog: false);
    }
  };

  @override
  List<_i1.RouteConfig> get routes => [
        _i1.RouteConfig(HomeRouteContainer.name,
            path: '/', fullMatch: false, usesTabsRouter: false),
        _i1.RouteConfig(HomeTabsWidget.name,
            path: 'home', fullMatch: false, usesTabsRouter: false),
        _i1.RouteConfig(WalletDetailRoute.name,
            path: 'wallet/:wallet_address',
            fullMatch: false,
            usesTabsRouter: false)
      ];
}

class HomeRouteContainer extends _i1.PageRouteInfo<HomeRouteContainerArgs> {
  HomeRouteContainer({this.key})
      : super(name, path: '/', args: HomeRouteContainerArgs(key: key));

  final _i5.Key? key;

  static const String name = 'HomeRouteContainer';
}

class HomeRouteContainerArgs {
  const HomeRouteContainerArgs({this.key});

  final _i5.Key? key;
}

class HomeTabsWidget extends _i1.PageRouteInfo {
  const HomeTabsWidget() : super(name, path: 'home');

  static const String name = 'HomeTabsWidget';
}

class WalletDetailRoute extends _i1.PageRouteInfo<WalletDetailRouteArgs> {
  WalletDetailRoute({this.walletAddress})
      : super(name,
            path: 'wallet/:wallet_address',
            args: WalletDetailRouteArgs(walletAddress: walletAddress),
            params: {'wallet_address': walletAddress});

  final String? walletAddress;

  static const String name = 'WalletDetailRoute';
}

class WalletDetailRouteArgs {
  const WalletDetailRouteArgs({this.walletAddress});

  final String? walletAddress;
}
