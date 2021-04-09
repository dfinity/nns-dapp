import 'package:core/app_colors.dart';
import 'package:flutter/material.dart';

import '../../dfinity.dart';
import '../../resource_orchstrator.dart';
import '../../wallet_router_delegate.dart';

extension ShowOverlay on OverlayState {
  OverlayEntry show(BuildContext parentContext, Widget widget) {
    OverlayEntry? entry;
    entry = OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
        parentContext: parentContext,
        overlayEntry: entry,
        child: widget,
      );
    });
    insert(entry);
    return entry;
  }
}

class OverlayBaseWidget extends StatelessWidget {
  const OverlayBaseWidget({
    Key? key,
    required this.parentContext,
    required this.child,
    required OverlayEntry? overlayEntry,
  })   : _overlayEntry = overlayEntry,
        super(key: key);

  final OverlayEntry? _overlayEntry;
  final BuildContext parentContext;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final hiveCoordinator = HiveLoader.of(parentContext).hiveCoordinator;
    final delegate = RouterDelegateWidget.of(parentContext).delegate;
    return RouterDelegateWidget(
      delegate: delegate,
      child: ResourceOrchestrator(
        hiveCoordinator: hiveCoordinator,
        child: Scaffold(
          backgroundColor: AppColors.transparent,
          body: Stack(
            children: [
              Container(
                color: AppColors.black.withOpacity(0.9),
                child: GestureDetector(onTap: () {
                  _overlayEntry?.remove();
                }),
              ),
              Center(
                child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: 800, maxHeight: 700),
                    child: child),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
