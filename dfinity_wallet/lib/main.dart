import 'package:core/app_colors.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/route_information_parser.dart';
import 'package:dfinity_wallet/service/hive_coordinator.dart';
import 'package:dfinity_wallet/ui/home/home_page.dart';
import 'package:dfinity_wallet/wallet_router_delegate.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

void main() {
  final hiveCoordinator = HiveCoordinator();
  final router = WalletRouterDelegate(hiveCoordinator);
  runApp(DfinityApp(hiveCoordinator: hiveCoordinator, router: router,));
}

class DfinityApp extends StatelessWidget {
  final HiveCoordinator hiveCoordinator;
  final WalletRouterDelegate router;

  const DfinityApp({Key? key, required this.hiveCoordinator, required this.router}) : super(key: key);


  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerDelegate: router,
      routeInformationParser: WalletRouteParser(),
      title: 'Internet Computer Wallet',
      theme: ThemeData(
          primarySwatch: MaterialColor(AppColors.blue500.value, {
            1000: AppColors.blue1000,
            900: AppColors.blue900,
            800: AppColors.blue800,
            700: AppColors.blue700,
            600: AppColors.blue600,
            500: AppColors.blue500,
            400: AppColors.blue400,
            300: AppColors.blue300,
            200: AppColors.blue200,
            100: AppColors.blue100,
            50: AppColors.blue50,
          }),
          textTheme: DfinityTextTheme,
          elevatedButtonTheme: ElevatedButtonThemeData(
              style: ButtonStyle(
                  shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)))))),
    );
  }
}
