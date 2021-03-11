import 'package:core/widget_forces/screen_edge.dart';

import '../core.dart';
import 'single_widget_force.dart';
import 'widget_forces.dart';


class QuadraticWidgetWallRepulsion extends SingleWidgetForce {
    double wallCharge;
    List<ScreenEdge> edges;
    GlobalKey wallWidgetKey;

    QuadraticWidgetWallRepulsion({this.wallCharge, this.edges, this.wallWidgetKey}) : super() {
        if (edges == null) {
            edges = ScreenEdge.values;
        }
    }

    @override
    Vector2 calculateForce(Vector2 bodyPosition, {Rect worldRect}) {
        final forceVector = edges
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
            return null;
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

    @override
  List<GlobalKey<State<StatefulWidget>>> get widgetKeys => (wallWidgetKey == null) ? [] : [wallWidgetKey];
}
