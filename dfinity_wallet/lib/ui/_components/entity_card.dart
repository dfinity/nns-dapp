import 'package:core/app_colors.dart';
import 'package:dfinity_wallet/data/data.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/dfinity.dart';

class EntityCard extends StatefulWidget {
  final DfinityEntity entity;
  final Widget child;
  EdgeInsets? margin;

  EntityCard({Key? key, required this.entity, required this.child, this.margin}) : super(key: key);
  @override
  _EntityCardState createState() => _EntityCardState();
}

class _EntityCardState extends State<EntityCard>
    with SingleTickerProviderStateMixin {
  AnimationController? _controller;
  Animation<Color?>? _colorTween;


  @override
  void initState() {

    if(widget.entity.isPending){
      _controller = AnimationController(vsync: this);
      _colorTween = ColorTween(begin: AppColors.background, end: AppColors.lighterBackground)
          .animate(_controller!);
      _controller!.repeat(min: 0, max: 1, reverse: true, period: 1.seconds);
    }
    super.initState();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: _colorTween?.value ?? AppColors.background,
      child: widget.child,
      margin: widget.margin,
    );
  }
}
