
import 'package:core/core.dart';
import 'package:core/widget_forces/screen_edge.dart';
import 'package:forge2d/forge2d.dart';

class WallRepulsionForce  {
  final double wallCharge;

  WallRepulsionForce({required this.wallCharge});

  Vector2 calculateForce(Vector2 bodyPosition, {required Rect worldRect}) {
    final forceVector = ScreenEdge.values
        .map((edge) {
      switch (edge) {
        case ScreenEdge.TOP:
          return Vector2(bodyPosition.x, worldRect.top);
        case ScreenEdge.BOTTOM:
          return Vector2(bodyPosition.x, worldRect.bottom);
        case ScreenEdge.LEFT:
          return Vector2(worldRect.left, bodyPosition.y);
        case ScreenEdge.RIGHT:
          return Vector2(worldRect.right, bodyPosition.y);
      }
    })
        .map((wallVec) => bodyPosition.forceFromChargeAtPosition(wallCharge, wallVec))
        .combine();

    final worldCenter = worldRect.center.asVector();
    final bodyPosPlusForce = bodyPosition + forceVector;
    final distFromCurPos = bodyPosition.distanceTo(worldCenter);
    final distFromNextPos = bodyPosPlusForce.distanceTo(worldCenter);

    //If the vector is pushing away from the world center, push to center
    if (distFromNextPos > distFromCurPos) {
      return worldCenter.directionTo(bodyPosition).scaled(wallCharge);
    } else {
      return forceVector;
    }
  }

}



class CenterRepulsionForce  {
  final double charge;

  CenterRepulsionForce({required this.charge});

  Vector2 calculateForce({ required Vector2 bodyPosition, required Rect worldRect}) {

    final senderPos = worldRect.center.asVector();
    var distanceSquared =
    senderPos.distanceToSquared(bodyPosition);
    if (distanceSquared < 3) {
      distanceSquared = 3;
    }
    var influence = charge / distanceSquared;
    return bodyPosition.directionTo(senderPos)
      ..scale(influence);
  }

}