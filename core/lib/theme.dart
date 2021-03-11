import 'package:core/core.dart';
import 'package:core/flutter_components/flutter_components.dart';
import 'jolly_phonics_scaling.dart';

import 'fonts.dart';

const ClassroomTextTheme = TextTheme(
  headline1: TextStyle(
      fontSize: 56, fontFamily: Fonts.quicksandBold, color: const Color(0xff454752), fontWeight: FontWeight.w700),
  headline2: TextStyle(
      fontSize: 40, fontFamily: Fonts.quicksandBold, color: const Color(0xff454752), fontWeight: FontWeight.w700),
  headline3: TextStyle(
      fontSize: 24, fontFamily: Fonts.quicksandBold, color: const Color(0xff454752), fontWeight: FontWeight.w700),
  headline4: TextStyle(
      fontSize: 16, fontFamily: Fonts.quicksandBold, color: const Color(0xff454752), fontWeight: FontWeight.w700),
  headline5: TextStyle(
      fontSize: 12, fontFamily: Fonts.quicksandBold, color: const Color(0xff454752), fontWeight: FontWeight.w700),
  bodyText1: TextStyle(
      fontSize: 16, fontFamily: Fonts.opensansRegular, color: const Color(0xff454752), fontWeight: FontWeight.normal),
  bodyText2: TextStyle(
      fontSize: 12, fontFamily: Fonts.opensansRegular, color: const Color(0xff454752), fontWeight: FontWeight.normal),
  button: TextStyle(
      fontSize: 16, fontFamily: Fonts.quicksandRegular, color: const Color(0xff454752), fontWeight: FontWeight.w700),
);

extension ThemeExt on BuildContext {
  ThemeData get theme => Theme.of(this);

  TextTheme get textTheme => theme.textTheme;
}

extension MoreTextStyles on BuildContext {
  TextStyle get whiteTextButton => TextStyle(fontSize: this.sy(15), fontFamily: Fonts.quicksandBold, color: AppColors.white);

  TextStyle get gray32 => TextStyle(
        fontSize: this.sy(32),
        color: AppColors.gray1000,
      );

  TextStyle get white32 => TextStyle(
        fontSize: this.sy(32),
        color: AppColors.white,
      );

  TextStyle get white12Quicksand =>
      TextStyle(fontSize: this.sy(12), fontFamily: Fonts.quicksandRegular, color: AppColors.white, fontWeight: FontWeight.w700);
}
