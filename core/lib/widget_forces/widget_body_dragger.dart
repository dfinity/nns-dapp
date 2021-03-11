import 'package:core/widget_forces/widget_body.dart';
import 'package:flutter/gestures.dart';
import 'package:forge2d/forge2d.dart';
import '../core.dart';
import 'flame_extensions.dart';

class ForceInteractor {
  Body? worldBody;
  late World physicsWorld;
  late List<WidgetBody> draggableBodies;
}

class WidgetBodyDragger extends StatefulWidget {
  final Widget? child;
  final Function(WidgetBody?)? onDragEnded;
  final Function(WidgetBody?)? onDragUpdated;

  WidgetBodyDragger({this.child, this.onDragEnded, this.onDragUpdated});

  @override
  WidgetBodyDraggerState createState() => WidgetBodyDraggerState();
}

class WidgetBodyDraggerState extends State<WidgetBodyDragger> with ForceInteractor {
  MouseJoint? mouseJoint;
  WidgetBody? draggingBody;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        draggingBody = draggableBodies
            .sortedBy((element) => element.sortOrder)
            .firstOrNullWhere((component) => component.frame.contains(details.localPosition));
        if (draggingBody != null) {
          draggingBody!.dragging = true;
          print("Dragging body ${draggingBody!.sortOrder}");
          mouseJoint = physicsWorld.createJoint(MouseJointDef()
            ..bodyA = worldBody!
            ..bodyB = draggingBody!.body!
            ..collideConnected = true
            ..maxForce = 100000 * draggingBody!.body!.mass
            ..dampingRatio = 0) as MouseJoint?;
        }
      },
      onPanUpdate: (details) {
        if(mouseJoint!= null){
          mouseJoint?.setTarget(mouseJoint!.getTarget().clone()..add(details.delta.toWorldVector()));
          widget.onDragUpdated?.call(draggingBody);
        }
      },
      onPanDown: (details) {},
      onPanEnd: (details) {
        if (mouseJoint != null) {
          draggingBody?.dragging = false;
          widget.onDragEnded?.call(draggingBody);
          draggingBody = null;
          physicsWorld.destroyJoint(mouseJoint!);
          mouseJoint = null;
        }
      },
      onPanCancel: () {
        if (mouseJoint != null) {
          draggingBody?.dragging = false;
          draggingBody = null;
          physicsWorld.destroyJoint(mouseJoint!);
          mouseJoint = null;
        }
      },
      child: widget.child,
    );
  }

  WidgetBody findBody(Offset localPosition) {
    return draggableBodies.firstWhere((element) => element.frame.contains(localPosition));
  }
}


class _MultipleGestureRecognizer extends PanGestureRecognizer {
  @override
  void rejectGesture(int pointer) {
    acceptGesture(pointer);
  }
}