import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/neurons/neuron_detail_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';
import 'package:flutter/material.dart';
import 'data/auth_token.dart';
import 'data/data.dart';
import 'wallet_router_delegate.dart';
import 'dfinity.dart';

class WalletRouteParser extends RouteInformationParser<PageConfig> {
  final HiveCoordinator hiveCoordinator;

  WalletRouteParser(this.hiveCoordinator);

  @override
  Future<PageConfig> parseRouteInformation(
      RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location ?? "");

    final path = uri.pathSegments[0];
    if (path.startsWith("access_token")) {
      final map = Map.fromEntries(path
          .split("&")
          .map((e) => e.split("=").let((it) => MapEntry(it[0], it[1]))));
      final token = map["access_token"];
      storeAccessToken(token!);
    }

    bool isAuthenticated = await hasValidAuthToken();
    if (!isAuthenticated) {
      return AuthPageConfiguration;
    }

    if (uri.pathSegments.isEmpty) {
      return HomeTabsPageConfiguration;
    }
    switch ("/$path") {
      case AuthPath:
        return AuthPageConfiguration;
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
                  walletIdentifier: int.parse(uri.pathSegments[1]),
                ));
      case NeuronDetailPath:
        return PageConfig(
            path: routeInformation.location!,
            requiredParent: HomeTabsPageConfiguration,
            createWidget: () => NeuronDetailWidget(
                  neuronIdentifier: int.parse(uri.pathSegments[1]),
                ));
      default:
        return HomeTabsPageConfiguration;
    }
  }

  Future<bool> hasValidAuthToken() async {
    await hiveCoordinator.openBoxes();
    final token = hiveCoordinator.authToken!.webAuthToken;
    if (token == null) {
      return false;
    } else {
      return token.creationDate.difference(DateTime.now()).inSeconds <
          1.days.inSeconds;
    }
  }

  @override
  RouteInformation restoreRouteInformation(PageConfig configuration) {
    return RouteInformation(location: configuration.path);
  }

  void storeAccessToken(String queryParameter) async {
    await hiveCoordinator.openBoxes();
    final box = hiveCoordinator.authToken!;

    await box.clear();
    box.put(
        WEB_TOKEN_KEY,
        AuthToken()
          ..creationDate = DateTime.now()
          ..data = queryParameter);
  }
}
