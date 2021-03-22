import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';
import 'package:flutter/material.dart';
import 'wallet_router_delegate.dart';

class WalletRouteParser extends RouteInformationParser<PageConfig> {
  @override
  Future<PageConfig> parseRouteInformation(
      RouteInformation routeInformation) async {
    // 1
    final uri = Uri.parse(routeInformation.location ?? "");
    // 2
    if (uri.pathSegments.isEmpty) {
      return HomeTabsPageConfiguration;
    }

    final path = uri.pathSegments[0];
    switch ("/$path") {
      case HomePath:
        return HomeTabsPageConfiguration;
      case CanisterTabsPath:
        return CanisterTabsPageConfiguration;
        case NeuronsTabsPath:
        return NeuronsTabsPageConfiguration;
      case WalletDetailPath:
        return PageConfig(
            path: routeInformation.location!,
            requiredParent: HomeTabsPageConfiguration,
            createWidget: () => WalletDetailPage(
                  walletIdentifier: uri.pathSegments[1],
                ));
      default:
        return HomeTabsPageConfiguration;
    }
  }

  @override
  RouteInformation restoreRouteInformation(PageConfig configuration) {
    return RouteInformation(location: configuration.path);
  }
}
