import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CircularLoader extends StatelessWidget {
  final Color color;

  const CircularLoader({Key? key, this.color = const Color(0xFFFFFFFF)})
      : super(key: key);

  @override
  Widget build(BuildContext context) => Container(
        color: color,
        child: Center(
          child: CircularProgressIndicator(),
        ),
      );
}
