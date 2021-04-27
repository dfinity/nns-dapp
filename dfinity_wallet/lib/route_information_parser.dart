import 'package:dfinity_wallet/resources_loading_page.dart';
import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/home/landing_widget.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_detail_widget.dart';
import 'package:dfinity_wallet/ui/proposals/proposal_detail_widget.dart';
import 'package:dfinity_wallet/ui/wallet/account_detail_widget.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'data/auth_token.dart';
import 'data/data.dart';
import 'ic_api/platform_ic_api.dart';
import 'wallet_router_delegate.dart';
import 'dfinity.dart';

class WalletRouteParser extends RouteInformationParser<PageConfig> {
  final HiveCoordinator hiveCoordinator;
  final BuildContext context;

  WalletRouteParser(this.hiveCoordinator, this.context);

  final staticPages = [
    AccountsTabPage,
    NeuronTabsPage,
    ProposalsTabPage,
    CanistersTabPage
  ].associateBy((e) => e.path.removePrefix('/'));

  final entityPages = [AccountPageDef, NeuronPageDef, ProposalPageDef, CanisterPageDef]
      .associateBy((e) => e.pathTemplate.removePrefix('/'));

  final apiObjectPages = [NeuronInfoPage].associateBy((e) => e.pathTemplate.removePrefix('/'));

  @override
  Future<PageConfig> parseRouteInformation(
      RouteInformation routeInformation) async {
    final path = routeInformation.location ?? "";
    if (path.startsWith("access_token")) {
      final map = Map.fromEntries(path
          .split("&")
          .map((e) => e.split("=").let((it) => MapEntry(it[0], it[1]))));
      final token = map["access_token"];
      print("access token found");
      return ResourcesLoadingPageConfig(
          Future.value(AccountsTabPage), storeAccessToken(token!),
          logoutOnFailure: true);
    }

    if (hiveCoordinator.hiveBoxes.authToken == null) {
      return ResourcesLoadingPageConfig(
          pageConfigRouteInformation(routeInformation), hasValidAuthToken(),
          logoutOnFailure: true);
    }

    bool isAuthenticated =
        isAuthTokenValid(hiveCoordinator.hiveBoxes.authToken!.webAuthToken);
    if (!isAuthenticated) {
      await hiveCoordinator.deleteAllData();
      return AuthPage;
    }

    return pageConfigRouteInformation(routeInformation);
  }

  Future<PageConfig> pageConfigRouteInformation(
      RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location ?? "");

    if (uri.pathSegments.isEmpty) {
      print("AccountsTabPage");
      return AccountsTabPage;
    }
    final path = uri.pathSegments[0];
    final staticPage = staticPages[path];
    if (staticPage != null) {
      print("StaticPage ${staticPage.path}");
      return staticPage;
    }

    final entityPageDef = entityPages[path];
    if (entityPageDef != null) {
      await hiveCoordinator.performInitialisation();
      final id = uri.pathSegments[1];
      final entity =
          entityPageDef.entityForIdentifier(id, hiveCoordinator.hiveBoxes);
      if (entity != null) {
        final entityPage = entityPageDef.createConfigWithEntity(entity);
        return entityPage;
      } else if (entityPageDef.entityFromIC != null) {
        final loadEntity = entityPageDef.entityFromIC!(id, context.icApi);
        return ResourcesLoadingPageConfig(
            loadEntity
                .then((value) => entityPageDef.createConfigWithEntity(value!)),
            loadEntity.then((value) => value != null),
            logoutOnFailure: false);
      }
    }

    final apiObjectPage = apiObjectPages[path];
    if(apiObjectPage != null){
      final id = uri.pathSegments[1];
      return apiObjectPage.createPageConfig(id);
    }

    return AccountsTabPage;
  }

  Future<bool> hasValidAuthToken() async {
    await hiveCoordinator.performInitialisation();
    return isAuthTokenValid(hiveCoordinator.hiveBoxes.authToken!.webAuthToken);
  }

  bool isAuthTokenValid(AuthToken? authToken) {
    if (authToken == null) {
      return false;
    } else {
      final date = authToken.creationDate;
      if (date == null) {
        return false;
      }
      return DateTime.now().difference(date).inSeconds < 1.days.inSeconds;
    }
  }

  @override
  RouteInformation restoreRouteInformation(PageConfig configuration) {
    return RouteInformation(location: configuration.path);
  }

  Future<bool> storeAccessToken(String queryParameter) async {
    await hiveCoordinator.performInitialisation();
    final token = hiveCoordinator.hiveBoxes.authToken!.webAuthToken;
    if (token != null) {
      token.data = queryParameter;
      token.creationDate = DateTime.now();
      await token.save();
      print("access token stored");
      context.icApi.buildServices();
      return true;
    } else {
      print("Could not find token on disk");
      return false;
    }
  }
}
