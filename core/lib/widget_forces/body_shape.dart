
import 'dart:ui';

import 'package:forge2d/forge2d.dart';

abstract class BodyShape {
    final bool sensor;

  BodyShape(this.sensor){
      assert(sensor != null);
  }

    FixtureDef createFixtureDef(Size widgetSize);

    Size sizeFromWidgetTree();
}
