import 'package:auto_route/annotations.dart';
import 'package:auto_route/auto_route.dart';
import 'package:dfinity_wallet/ui/home/home_page.dart';
import 'package:dfinity_wallet/ui/home/home_tabs_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';

@MaterialAutoRouter(
  replaceInRouteName: 'Page,Route',
  routes: <AutoRoute>[
    AutoRoute(page: HomePageContainer, initial: true),
    CustomRoute(path: "home", page: HomeTabsWidget, transitionsBuilder: TransitionsBuilders.fadeIn),
    AutoRoute(path: "wallet/:wallet_address", page: WalletDetailPage)
  ],
)
class $AppRouter {}
