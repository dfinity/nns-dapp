import 'dart:math';

import 'package:core/widget_forces/single_widget_force.dart';
import 'dual_widget_force.dart';
import 'package:flutter/cupertino.dart';
import 'force_removal_criteria.dart';
import 'widget_forces.dart';
import 'package:forge2d/forge2d.dart';

class QuadraticRepulsionWidgetForce extends DualWidgetForce {
    double? charge;

    QuadraticRepulsionWidgetForce({GlobalKey? sender, GlobalKey? receiver, this.charge}) : super(sender, receiver);

    Vector2 calculateForce(Rect? senderBox, Rect? recieverBox) {
        var distanceSquared = senderBox!.distanceBetweenSquared(recieverBox!);
        if (distanceSquared < 3) {
            distanceSquared = 3;
        }
        var influence = charge! / distanceSquared;
        return recieverBox.center.asVector().directionTo(senderBox.center.asVector())..scale(influence);
    }


}

extension DistanceBetween on Rect {
    double distanceBetweenSquared(Rect second) {
        final wDistance = max(0.0, expandToInclude(second).width - (width + second.width));
        final hDistance = max(0.0, expandToInclude(second).height - (height + second.height));
        return Vector2.zero().distanceToSquared(Vector2(wDistance, hDistance));
    }
}


class WidgetAttractionForce extends DualWidgetForce {
    double? charge = 1;

    WidgetAttractionForce({GlobalKey? sender, GlobalKey? receiver, this.charge}) : super(sender, receiver);

    Vector2 calculateForce(Rect? senderBox, Rect? recieverBox) {
        return senderBox!.center.asVector()
            ..sub(recieverBox!.center.asVector())
            ..scale(charge!);
    }

}

class PointAttractionForce extends SingleWidgetForce {
    double? charge = 1;
    Offset attractionPoint;
    ForceRemovalCriteria? removalCriteria;
    Function? onRemoval;

    PointAttractionForce({required this.attractionPoint, this.charge, this.removalCriteria, this.onRemoval}) : super();

    Vector2 calculateForce(Vector2 bodyPosition, {Rect? worldRect}) {
        return attractionPoint.toWorldVector()
            ..sub(bodyPosition)
            ..scale(charge!);
    }

}
