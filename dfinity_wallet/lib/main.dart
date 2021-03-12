import 'package:core/app_colors.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/home/home_page.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(DfinityApp());
}

class DfinityApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Internet Computer Wallet',
      theme: ThemeData(
        primarySwatch: MaterialColor(AppColors.blue900.value, {
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
        textTheme: DfinityTextTheme
      ),
      home: HomePageContainer(),
    );
  }
}
