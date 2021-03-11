

import 'package:forge2d/forge2d.dart';
import 'package:core/widget_forces/widget_force.dart';

import '../core.dart';


abstract class DualWidgetForce extends WidgetForce {
    final GlobalKey sender;
    final GlobalKey receiver;

    DualWidgetForce(this.sender, this.receiver);

    Vector2 calculateForce(Rect senderBox, Rect receiverBox);
    List<GlobalKey> get widgetKeys => [sender, receiver];
}