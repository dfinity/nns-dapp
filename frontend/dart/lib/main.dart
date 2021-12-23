import 'package:core/app_colors.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'nns_dapp.dart';
import 'route_information_parser.dart';
import 'wallet_router_delegate.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
  final hiveBoxes = HiveBoxes();
  final router = WalletRouterDelegate(hiveBoxes);
  runApp(NnsDapp(
    hiveBoxes: hiveBoxes,
    router: router,
  ));
}

class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'es'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) {
    // Returning a SynchronousFuture here because an async "load" operation
    // isn't needed to produce an instance of DemoLocalizations.
    return SynchronousFuture<AppLocalizations>(AppLocalizations(locale));
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}

class NnsDapp extends StatelessWidget {
  final HiveBoxes hiveBoxes;
  final WalletRouterDelegate router;

  const NnsDapp({Key? key, required this.hiveBoxes, required this.router})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    precacheImage(AssetImage("assets/nns_background.jpeg"), context);
    return HiveBoxesWidget(
      boxes: hiveBoxes,
      child: ICApiManager(
        child: Builder(builder: (context) {
          return MaterialApp.router(
            builder: (context, child) {
              return Theme(
                  data: getTheme(Responsive.isMobile(context)), child: child!);
            },
            debugShowCheckedModeBanner: false,
            routerDelegate: router,
            routeInformationParser: WalletRouteParser(hiveBoxes, context),
            title: 'Network Nervous System',
          );
        }),
      ),
    );
  }

  ThemeData getTheme(bool isMobile) {
    return ThemeData(
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
      textTheme: nnsDappTextTheme(isMobile),
      elevatedButtonTheme: ElevatedButtonThemeData(
          style: ButtonStyle(
        shape: MaterialStateProperty.all(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
        backgroundColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.disabled)) {
            return AppColors.gray400;
          } else {
            return AppColors.blue600;
          }
        }),
      )),
      textButtonTheme: TextButtonThemeData(
          style: ButtonStyle(
              textStyle:
                  MaterialStateProperty.all(TextStyle(color: Colors.white)),
              overlayColor: MaterialStateProperty.all(
                  AppColors.gray400.withOpacity(0.04)))),
      cardTheme: CardTheme(
          color: AppColors.background,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          shadowColor: Colors.white.withOpacity(0.3),
          elevation: 7,
          margin: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 0)),
    );
  }
}
