import 'package:flutter/material.dart';
import 'data/data.dart';
import 'resources_loading_page.dart';
import 'wallet_router_delegate.dart';
import 'nns_dapp.dart';
import 'dart:html' as html;

class WalletRouteParser extends RouteInformationParser<PageConfig> {
  final HiveBoxes hiveBoxes;
  final BuildContext context;

  WalletRouteParser(this.hiveBoxes, this.context);

  final staticPages = [
    accountsTabPage,
    neuronTabsPage,
    proposalsTabPage,
    canistersTabPage
  ].associateBy((e) => e.path.removePrefix('/'));

  final entityPages = [
    accountPageDef,
    neuronPageDef,
    proposalPageDef,
    canisterPageDef
  ].associateBy((e) => e.pathTemplate.removePrefix('/'));

  final apiObjectPages =
      [neuronInfoPage].associateBy((e) => e.pathTemplate.removePrefix('/'));

  @override
  Future<PageConfig> parseRouteInformation(
      RouteInformation routeInformation) async {
    bool isAuthenticated = context.icApi.isLoggedIn();
    if (!isAuthenticated) {
      // html.window.location.assign('/v2/');
      return authPage;
    }

    return pageConfigRouteInformation(routeInformation);
  }

  Future<PageConfig> pageConfigRouteInformation(
      RouteInformation routeInformation) async {
    final uri = Uri.parse(routeInformation.location ?? "");

    if (uri.pathSegments.isEmpty) {
      return accountsTabPage;
    }
    final path = uri.pathSegments[0];
    final staticPage = staticPages[path];
    if (staticPage != null) {
      return staticPage;
    }

    final entityPageDef = entityPages[path];
    if (entityPageDef != null) {
      final id = uri.pathSegments[1];
      final entity = entityPageDef.entityForIdentifier(id, hiveBoxes);
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
    if (apiObjectPage != null) {
      final id = uri.pathSegments[1];
      return apiObjectPage.createPageConfig(id);
    }

    return accountsTabPage;
  }

  @override
  RouteInformation restoreRouteInformation(PageConfig configuration) {
    return RouteInformation(location: configuration.path);
  }
}
