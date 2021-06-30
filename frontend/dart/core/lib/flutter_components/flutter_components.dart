import 'package:core/fonts.dart';
import 'package:core/app_colors.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

export 'package:core/extensions.dart';
export 'package:core/extensions.dart';
export 'package:core/extensions.dart';
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
            children: children)
      ),
    );
  }
}
