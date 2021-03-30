import 'package:core/core.dart';

const DfinityTextTheme = TextTheme(
    headline1: TextStyle(
            fontSize: 40, fontFamily: Fonts.circularBold, color: AppColors.gray100, fontWeight: FontWeight.w700),
    headline2: TextStyle(
            fontSize: 32, fontFamily: Fonts.circularBold, color: AppColors.gray100, fontWeight: FontWeight.w700),
    headline3: TextStyle(
            fontSize: 24, fontFamily: Fonts.circularBold, color: AppColors.gray100, fontWeight: FontWeight.w700),
    headline4: TextStyle(
            fontSize: 16, fontFamily: Fonts.circularBold, color: AppColors.gray100, fontWeight: FontWeight.w700),
    headline5: TextStyle(
            fontSize: 12, fontFamily: Fonts.circularBold, color: AppColors.gray100, fontWeight: FontWeight.w700),
    bodyText1: TextStyle(
            fontSize: 24, fontFamily: Fonts.circularBook, color: AppColors.gray100, fontWeight: FontWeight.normal),
    bodyText2: TextStyle(
            fontSize: 18, fontFamily: Fonts.circularBook, color: AppColors.gray100, fontWeight: FontWeight.normal),
    button: TextStyle(
            fontSize: 16, fontFamily: Fonts.circularBook, color: AppColors.gray100, fontWeight: FontWeight.w700),
);

extension ThemeExt on BuildContext {
    ThemeData get theme => Theme.of(this);

    TextTheme get textTheme => theme.textTheme;
}


extension ReCcolor on TextStyle? {
    TextStyle? get gray800 => this?.copyWith(color: AppColors.gray800);
}