
import 'package:forge2d/forge2d.dart';

import 'widget_forces.dart';
import 'package:flutter/cupertino.dart';

abstract class SingleWidgetForce extends WidgetForce {

    Vector2 calculateForce(Vector2 bodyPosition);

    @override
    List<GlobalKey?> get widgetKeys => [];
}