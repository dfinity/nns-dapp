import 'package:forge2d/forge2d.dart';
import 'package:core/core.dart';
import 'package:core/widget_forces/widget_force.dart';

import 'body_shape.dart';
import 'widget_forces.dart';

class WidgetBody {
  final GlobalKey? forceKey;
  final List<WidgetForce>? forces;
  final BodyShape? bodyShape;
  final Widget? widget;
  final Offset? startingPosition;
  final int sortOrder;
  final double damping;
  bool dragging = false;
  bool draggable = true;
  bool sensor = false;
  Body? body;

  WidgetBody({this.bodyShape, this.forceKey, this.forces, this.widget, this.startingPosition, this.sortOrder = 0, this.damping = 10});

  static BodyDef createBodyDef(Vector2 position, {required double damping}) => BodyDef()
    ..fixedRotation = true
    ..type = BodyType.DYNAMIC
    ..linearDamping = damping
    ..position = position;

  Rect get  frame {
    final size = bodyShape!.sizeFromWidgetTree()!;
    return Rect.fromCenter(center: body!.position.toOffset(), width: size.width, height: size.height);
  }
}
