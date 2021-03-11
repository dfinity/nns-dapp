import 'package:core/fonts.dart';
import 'package:core/app_colors.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

export 'package:core/extensions.dart';
export 'package:core/extensions.dart';
export 'package:core/extensions.dart';
export 'package:core/widget_forces/flame_extensions.dart';
export 'package:dartx/dartx.dart';
export 'package:flutter/material.dart';

export 'circle_painter.dart';
export 'title_subtitle_option.dart';

class ScaffoldSafeAreaColumn extends StatelessWidget {
  final List<Widget> children;

  const ScaffoldSafeAreaColumn({Key? key, required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: children),
      ),
    );
  }
}

class OnboardingTitle extends StatelessWidget {
  final String text;
  final double fontSize;

  const OnboardingTitle({Key? key, required this.text, required this.fontSize})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Center(
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
              fontSize: fontSize,
              color: AppColors.gray1000,
              fontFamily: Fonts.quicksandBold),
        ),
      ),
    );
  }
}
