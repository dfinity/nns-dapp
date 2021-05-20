import 'package:dfinity_wallet/resources_loading_page.dart';
import 'package:flutter/material.dart';
import 'data/data.dart';
import 'wallet_router_delegate.dart';
import 'dfinity.dart';

class WalletRouteParser extends RouteInformationParser<PageConfig> {
  final HiveBoxes hiveBoxes;
  final BuildContext context;

  WalletRouteParser(this.hiveBoxes, this.context);

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
    bool isAuthenticated = context.icApi.isLoggedIn();
    if (!isAuthenticated) {
      return AuthPage;
    }

    return pageConfigRouteInformation(routeInformation);
  }

  Future<PageConfig> pageConfigRouteInformation(
      RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location ?? "");

    if (uri.pathSegments.isEmpty) {
      return AccountsTabPage;
    }
    final path = uri.pathSegments[0];
    final staticPage = staticPages[path];
    if (staticPage != null) {
      return staticPage;
    }

    final entityPageDef = entityPages[path];
    if (entityPageDef != null) {
      final id = uri.pathSegments[1];
      final entity =
          entityPageDef.entityForIdentifier(id, hiveBoxes);
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

  @override
  RouteInformation restoreRouteInformation(PageConfig configuration) {
    return RouteInformation(location: configuration.path);
  }
}
