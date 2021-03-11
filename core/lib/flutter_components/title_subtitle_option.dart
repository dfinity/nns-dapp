import 'package:core/fonts.dart';
import 'package:core/app_colors.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'circle_painter.dart';
import 'flutter_components.dart';

class TitleSubtitleOption extends StatefulWidget {
  final String? title;
  final String? subtitle;
  final Function? onTap;

  const TitleSubtitleOption({Key? key, this.title, this.subtitle, this.onTap})
      : super(key: key);

  @override
  _TitleSubtitleOptionState createState() => _TitleSubtitleOptionState();
}

class _TitleSubtitleOptionState extends State<TitleSubtitleOption> {
  final padding = 12.0;
  bool highlighted = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(highlighted ? 7.0 : 8.0),
      child: GestureDetector(
        onTap: () async {
          setState(() {
            highlighted = true;
          });
          await Future.delayed(0.3.seconds);
          widget.onTap!();
          await Future.delayed(0.1.seconds);
          setState(() {
            highlighted = false;
          });
        },
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.all(Radius.circular(padding * 2)),
            border: Border.all(
                color: DrawSelectionIndicator.colorForSelected(highlighted),
                width: highlighted ? 2 : 1),
          ),
          child: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.all(8.0),
                child: SelectionIndicator(selected: highlighted),
              ),
              Flexible(
                child: Container(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 8.0, top: 8, bottom: 0, right: 20),
                        child: Text(
                          widget.title!,
                          style: TextStyle(
                            color: Color(0xff666A7A),
                            fontFamily: Fonts.opensansRegular,
                            fontSize: 24,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          widget.subtitle!,
                          textAlign: TextAlign.left,
                          maxLines: 3,
                          softWrap: true,
                          style: TextStyle(
                            color: Color(0xff9A9FB8),
                            fontFamily: Fonts.opensansRegular,
                            fontSize: 16,
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
