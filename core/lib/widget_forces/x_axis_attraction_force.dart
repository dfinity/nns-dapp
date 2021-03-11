import 'dual_widget_force.dart';
import 'package:flutter/cupertino.dart';
import 'package:forge2d/forge2d.dart';
import 'flame_extensions.dart';

class XAxisAttractionForce extends DualWidgetForce {
    double charge = 1;

    XAxisAttractionForce({GlobalKey sender, GlobalKey receiver, this.charge}) : super(sender, receiver);

    Vector2 calculateForce(Rect senderBox, Rect recieverBox) {
        return senderBox.center.asVector()
            ..sub(recieverBox.center.asVector())
            ..scale(charge)
            ..x = 0;
    }
}