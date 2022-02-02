import 'package:core/core.dart';

TextTheme nnsDappTextTheme(bool isMobile) {
  return TextTheme(
    headline1: TextStyle(
        fontSize: isMobile ? 32 : 40,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    headline2: TextStyle(
        fontSize: isMobile ? 24 : 32,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    headline3: TextStyle(
        fontSize: isMobile ? 16 : 20,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    headline4: TextStyle(
        fontSize: isMobile ? 14 : 18,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    headline5: TextStyle(
        fontSize: isMobile ? 12 : 16,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    headline6: TextStyle(
        fontSize: isMobile ? 10 : 14,
        fontFamily: Fonts.circularBold,
        color: AppColors.gray50,
        fontWeight: FontWeight.w700),
    subtitle1: TextStyle(
        fontSize: isMobile ? 20 : 24,
        fontFamily: Fonts.circularBook,
        color: AppColors.gray200, //AppColors.gray50,
        fontWeight: FontWeight.normal),
    subtitle2: TextStyle(
        fontSize: isMobile ? 14 : 18,
        fontFamily: Fonts.circularBook,
        color: AppColors.gray200,
        fontWeight: FontWeight.normal),
    bodyText1: TextStyle(
        fontSize: isMobile ? 14 : 18,
        fontFamily: Fonts.circularBook,
        color: AppColors.gray100,
        fontWeight: FontWeight.normal),
    bodyText2: TextStyle(
        fontSize: isMobile ? 12 : 14,
        fontFamily: Fonts.circularBook,
        color: AppColors.gray200,
        fontWeight: FontWeight.normal),
    button: TextStyle(
        fontSize: isMobile ? 20 : 22.0,
        fontFamily: Fonts.circularBook,
        color: AppColors.gray100,
        fontWeight: FontWeight.normal),
  );
}

extension ThemeExt on BuildContext {
  ThemeData get theme => Theme.of(this);

  TextTheme get textTheme => theme.textTheme;
}

extension ReCcolor on TextStyle? {
  TextStyle? get gray800 => this?.copyWith(color: AppColors.gray800);
}
