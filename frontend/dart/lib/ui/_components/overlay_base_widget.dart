import 'dart:math';

import 'package:core/app_colors.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:flutter/material.dart';

import '../../dfinity.dart';
import '../../resource_orchstrator.dart';
import '../../wallet_router_delegate.dart';

class OverlayBaseWidget extends StatefulWidget {
  static OverlayEntry show(
    BuildContext context,
    Widget widget, {
    double borderRadius = 20,
    Size maxSize = const Size(600, 700),
  }) {
    OverlayEntry? entry;
    final parentContext = context;
    entry = OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
        parentContext: parentContext,
        overlayEntry: entry,
        child: widget,
        borderRadius: borderRadius,
        maxSize: maxSize,
      );
    });
    Overlay.of(parentContext)?.insert(entry);
    return entry;
  }

  const OverlayBaseWidget(
      {Key? key,
      required this.parentContext,
      required this.child,
      required OverlayEntry? overlayEntry,
      this.borderRadius = 20,
      this.maxSize = const Size(800, 700)})
      : _overlayEntry = overlayEntry,
        super(key: key);

  final OverlayEntry? _overlayEntry;
  final BuildContext parentContext;
  final Widget child;
  final double borderRadius;
  final Size maxSize;

  @override
  _OverlayBaseWidgetState createState() => _OverlayBaseWidgetState();

  static _OverlayBaseWidgetState? of(BuildContext context) =>
      context.findAncestorStateOfType<_OverlayBaseWidgetState>();
}

class _OverlayBaseWidgetState extends State<OverlayBaseWidget>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  late Animation<double> scaleAnim;
  late Animation<double> opacityAnim;

  @override
  void initState() {
    _animationController =
        AnimationController(vsync: this, duration: 5.seconds);
    final Animation<double> curve =
        CurvedAnimation(parent: _animationController, curve: Curves.easeOut);
    _animation = Tween(begin: 0.0, end: 1.0).animate(curve)
      ..addListener(() {
        setState(() {});
      });
    scaleAnim = Tween(begin: 0.95, end: 1.0).animate(CurvedAnimation(
        parent: _animationController, curve: Curves.easeOutBack));
    opacityAnim = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(
        parent: _animationController, curve: Curves.easeOutExpo));
    _animationController.animateTo(1,
        duration: 0.8.seconds, curve: Curves.easeInOut);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final delegate = RouterDelegateWidget.of(widget.parentContext).delegate;
    return RouterDelegateWidget(
      delegate: delegate,
      child: ResourceOrchestrator(
        hiveBoxes: context.boxes.boxes,
        child: Scaffold(
          backgroundColor: AppColors.transparent,
          body: Stack(
            children: [
              Container(
                color: AppColors.black.withOpacity(0.6 * _animation.value),
                child: GestureDetector(onTap: () {
                  dismiss();
                }),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Center(
                  child: Container(
                    decoration: BoxDecoration(
                        borderRadius:
                            BorderRadius.circular(widget.borderRadius),
                        boxShadow: [
                          BoxShadow(
                              color:
                                  AppColors.black.withOpacity(_animation.value),
                              blurRadius: MediaQuery.of(context).size.width *
                                  _animation.value,
                              spreadRadius: 100 * _animation.value)
                        ]),
                    child: Transform.scale(
                      scale: min(1.0, scaleAnim.value),
                      child: Opacity(
                        opacity: min(1.0, opacityAnim.value * 2),
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.lighterBackground,
                            borderRadius:
                                BorderRadius.circular(widget.borderRadius),
                          ),
                          child: ClipRRect(
                            borderRadius:
                                BorderRadius.circular(widget.borderRadius),
                            child: ConstrainedBox(
                                constraints: Responsive.isDesktop(context) |
                                        Responsive.isTablet(context)
                                    ? BoxConstraints(
                                        maxWidth: widget.maxSize.width,
                                        maxHeight: widget.maxSize.height)
                                    : BoxConstraints(
                                        maxWidth: widget.maxSize.width / 2,
                                        maxHeight: widget.maxSize.height / 1.1),
                                child: widget.child),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void dismiss() async {
    scaleAnim = Tween(begin: 0.8, end: 1.0).animate(
        CurvedAnimation(parent: _animationController, curve: Curves.easeIn))
      ..addListener(() {
        setState(() {});
      });
    opacityAnim = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(
        parent: _animationController, curve: Curves.easeInExpo));
    await _animationController.animateTo(0,
        duration: 0.5.seconds, curve: Curves.easeInOut);
    widget._overlayEntry?.remove();
  }

  @override
  void dispose() {
    super.dispose();
    _animationController.dispose();
  }
}
