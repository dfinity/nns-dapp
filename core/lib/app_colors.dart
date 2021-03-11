import 'dart:ui';

import 'package:flutter/material.dart';

class AppColors {
  static const Color primaryYellow = Color.fromRGBO(255, 199, 94, 1);

  static const Color black = Color.fromRGBO(0, 0, 0, 1);
  static const Color gray1000 = Color.fromRGBO(69, 71, 82, 1);
  static const Color gray800 = Color(0xff676A7A);
  static const Color gray600 = Color.fromRGBO(154, 159, 184, 1);
  static const Color gray500 = Color.fromRGBO(221, 221, 221, 1);
  static const Color gray400 = Color.fromRGBO(240, 241, 245, 1);
  static const Color gray200 = Color.fromRGBO(244, 245, 249, 1);
  static const Color gray100 = Color.fromRGBO(250, 251, 255, 1);
  static const Color white = Colors.white;
  static const Color transparent = Colors.transparent;
  static const Color grayIcon = Color.fromRGBO(157, 161, 186, 1);
  static const Color grayDisabledShadow = Color.fromRGBO(154, 159, 184, 0.5);
  static const Color grayDisabledPrimary = Color.fromRGBO(221, 221, 221, 1);

  static const Color orange = Color.fromRGBO(255, 163, 95, 1);
  static const Color pink = Color.fromRGBO(255, 127, 163, 1);
  static const Color purple = Color.fromRGBO(197, 118, 226, 1);
  static const Color purple200 = Color.fromRGBO(245, 226, 251, 1);
  static const Color blue = Color.fromRGBO(70, 196, 242, 1);
  static const Color turquoise = Color.fromRGBO(31, 199, 204, 1);
  static const Color green = Color.fromRGBO(97, 207, 159, 1);
  static const Color midgreen = Color.fromRGBO(157,225,196, 1);
  static const Color lightGreen = Color(0xffD9F3E8);

  static const Color primaryBlue = Color.fromRGBO(74, 111, 255, 1);

  static const Color blue1000 = Color.fromRGBO(32, 46, 149, 1);
  static const Color blue800 = Color.fromRGBO(49, 73, 224, 1);
  static const Color blue600 = Color.fromRGBO(68, 102, 255, 1.0);
  static const Color blue500 = primaryBlue;
  static const Color blue400 = Color.fromRGBO(96, 134, 249, 1);
  static const Color blue200 = Color.fromRGBO(212, 221, 255, 1);
  static const Color blue100 = Color.fromRGBO(241, 244, 255, 1);

  static const Color red1000 = Color.fromRGBO(194, 50, 50, 1);
  static const Color red800 = Color.fromRGBO(224, 66, 66, 1);
  static const Color red600 = Color.fromRGBO(255, 84, 84, 1);
  static const Color red = Color.fromRGBO(255, 100, 100, 1);
  static const Color red400 = Color.fromRGBO(255, 118, 118, 1);
  static const Color red200 = Color.fromRGBO(255, 218, 218, 1);
  static const Color red100 = Color.fromRGBO(255, 243, 243, 1);
  static const Color red500 = red;

  static const Color turquoiseDark = Color.fromRGBO(31, 199, 204, 1);

  static const List<Color> soundGroupColors = [
    const Color(0xffFF7676),
    const Color(0xffC576e2),
    const Color(0xff46c4f2),
    const Color(0xff61cf9f),
    const Color(0xffff7fa3),
    const Color(0xffFFA35F),
    const Color(0xffc58361),
  ];

  static const List<Color> secondaryColors = [
    const Color(0xFFFF6464),
    const Color(0xFFFFC75E),
    const Color(0xFFFF7FA3),
    const Color(0xFFC576E2),
    const Color(0xFF46C4F2),
    const Color(0xFF61CF9F),
  ];

  static Color soundGroupColorForIndex(int index) => soundGroupColors[index % soundGroupColors.length];
}

extension MakePaint on Color {
  Paint get paint => Paint()..color = this;
}
