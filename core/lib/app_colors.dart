import 'dart:ui';

import 'package:flutter/material.dart';

class AppColors {
  static const Color primaryYellow = Color.fromRGBO(255, 199, 94, 1);

  static const Color background = Color(0xff0B0C0C);
  static const Color lightBackground = Color(0xff383c3c);
  static const Color lighterBackground = Color(0xff48494c);

  static const Color black = Color(0xff292A2E);
  static const Color gray1000 = Color(0xff43454C);
  static const Color gray800 = Color(0xff676A7A);
  static const Color gray600 = Color(0xff60606c);
  static const Color gray500 = Color(0xff7D7D8C);
  static const Color gray400 = Color(0xffA9A9B2);
  static const Color gray200 = Color(0xffC9C9CF);
  static const Color gray100 = Color(0xffEAEAEC);
  static const Color white = Colors.white;
  static const Color transparent = Colors.transparent;


  static const Color blue1000 = Color(0xff001529);
  static const Color blue900 = Color(0xff001F3D);
  static const Color blue800 = Color(0xff003566);
  static const Color blue700 = Color(0xff00478F);
  static const Color blue600 = Color(0xff005FB8);
  static const Color blue500 = Color(0xff0081FF);
  static const Color blue400 = Color(0xff339CFF);
  static const Color blue300 = Color(0xff70B8FF);
  static const Color blue200 = Color(0xff99CEFF);
  static const Color blue100 = Color(0xffD6EBFF);
  static const Color blue50 = Color(0xffEBF5FF);

  static const Color yellow1000 = Color(0xff3B2502);
  static const Color yellow800 = Color(0xff764A04);
  static const Color yellow600 = Color(0xffB17006);
  static const Color yellow500 = Color(0xffEC9509);
  static const Color yellow400 = Color(0xffF9B74D);
  static const Color yellow200 = Color(0xffFCD79C);
  static const Color yellow100 = Color(0xffFEEFD7);
}

extension MakePaint on Color {
  Paint get paint => Paint()..color = this;
}
