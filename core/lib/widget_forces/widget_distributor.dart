import 'dart:math';

import 'package:core/core.dart';
import 'package:core/widget_forces/quadratic_widget_wall_repulstion.dart';
import 'package:core/widget_forces/single_widget_force.dart';
import 'dual_widget_force.dart';
import 'widget_body.dart';
import 'package:forge2d/forge2d.dart';
import 'flame_extensions.dart';

class WidgetDistributor {
  late List<WidgetBody> virtualBodies;
  late Map<GlobalKey, Vector2> positionMap;
  late Map<GlobalKey, Rect> keyToFrameMap;
  final World physicsWorld = World(Vector2.zero(), DefaultBroadPhaseBuffer(DynamicTreeFlatNodes()));
  final Rect worldRect;


  WidgetDistributor(List<WidgetBody> body, this.worldRect) {
    virtualBodies = body.map((e) {
      final staticPosition = e.body?.position ?? e.startingPosition?.toWorldVector();
      final position = staticPosition ?? worldRect.scaleSize(0.5).randomVectorInside;
      final bodyDef = WidgetBody.createBodyDef(position, damping: 0.5)
        ..type = (staticPosition == null) ? BodyType.DYNAMIC : BodyType.STATIC;

      final body = physicsWorld.createBody(bodyDef);
      return WidgetBody(bodyShape: e.bodyShape, forceKey: e.forceKey, forces: e.forces, widget: e.widget)..body = body;
    }).toList();

    final allKeys = body.flatMap((element) => [
      element.forceKey,
      ...element.forces!.flatMap((e) => e.widgetKeys),
    ]).distinct() as Iterable<GlobalKey<State<StatefulWidget>>>;
    keyToFrameMap = allKeys.filterNot((element) => element?.currentContext == null).associateWith((element) => element.frame.toMeterRect);

    logTime("time to layout", () {
      var hasCompleted = false;
      var numIterations = 0;
      while((!hasCompleted || numIterations < 10) && numIterations < 100 ){
        final multiplier = sqrt((40 - numIterations).clamp(1, 20));
        final clamped = max(1.0, multiplier);
        hasCompleted = runSimulation(clamped);
        numIterations++;

        // print("multiplier $multiplier");
      }
      // print("numiterations $numIterations");
    });
  }

  static Random random = Random();

  bool runSimulation(double multiplier) {
    physicsWorld.stepDt(100, 100, 10);
    return applyForcesToBodies(multiplier);
  }

  bool applyForcesToBodies(double multiplier) {
    positionMap = virtualBodies.associate(((element) => MapEntry(element.forceKey!, element.body!.position)) as MapEntry<GlobalKey<State<StatefulWidget>>, Vector2> Function(WidgetBody));
    virtualBodies.forEach((widgetBody) {
      widgetBody.forces!.forEach((force) {
        final receiverBody = widgetBody.body!;

        Vector2 forceVector = Vector2.zero();
        if (force is QuadraticWidgetWallRepulsion) {
          Rect? rect = worldRect;
          if(force.wallWidgetKey != null){
            rect = keyToFrameMap[force.wallWidgetKey!];
          }
          forceVector = force.calculateForce(receiverBody.position, worldRect: rect!);
        } else if (force is DualWidgetForce) {
          final senderPos = positionMap[force.sender!];
          if (senderPos != null) {
            forceVector = force.calculateForce(
              Rect.fromCenter(center: senderPos.asOffset(), width: 1, height: 1),
              Rect.fromCenter(center: receiverBody.position.asOffset(), width: 1, height: 1),
            );
          } else {
            forceVector = force.calculateForce(
              force.sender!.frame.toMeterRect,
              Rect.fromCenter(center: receiverBody.position.asOffset(), width: 1, height: 1),
            );
          }
        }else if (force is SingleWidgetForce) {
          forceVector = force.calculateForce(receiverBody.position - worldRect.topLeft.asVector());
        }
        final impulse = forceVector * multiplier;
        receiverBody.applyLinearImpulse(impulse, point: receiverBody.position, wake: true);
      });
    });

    return virtualBodies.all((element) => element.body!.linearVelocity.length < 0.1);
  }

  Vector2 positionForWidget(GlobalKey? key) {
    final vector = positionMap[key!]!;
    return Vector2(vector.x - worldRect.left, vector.y - worldRect.top);
  }
}
