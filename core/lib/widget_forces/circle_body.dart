import 'dart:ui';

import 'package:forge2d/forge2d.dart';
import 'package:core/core.dart';

import 'body_shape.dart';
import 'flame_extensions.dart';

class FixedCircleBody extends BodyShape {
  final double radius;

  FixedCircleBody(this.radius, {bool sensor = true}) : super(sensor);

  @override
  Size sizeFromWidgetTree(){
    return Size.fromRadius(radius);
  }

  @override
  FixtureDef createFixtureDef(Size widgetSize) {
    return FixtureDef()
      ..shape = (CircleShape()..radius = radius.toMeters())
      ..friction = 0
      ..isSensor = sensor;
  }
}


class CircleBody extends BodyShape {
  final GlobalKey matchingWidgetKey;

  CircleBody(this.matchingWidgetKey, {bool sensor = true}) : super(sensor);

  @override
  Size? sizeFromWidgetTree(){
    return matchingWidgetKey.currentContext!.size;
  }

  @override
  FixtureDef createFixtureDef(Size widgetSize) {
    return FixtureDef()
      ..shape =(CircleShape()..radius = widgetSize.longestSide.half.half.toMeters())
      ..friction =(0)
      ..isSensor = sensor;
  }
}

class BoxBody extends BodyShape {
  final GlobalKey matchingWidgetKey;

  BoxBody(this.matchingWidgetKey, {bool sensor = true}) : super(sensor);

  @override
  FixtureDef createFixtureDef(Size widgetSize) {
    final halfWidth = widgetSize.width.toMeters().half;
    final halfHeight = widgetSize.height.toMeters().half;
    return FixtureDef()
            ..shape = (PolygonShape()..setAsBox(halfWidth, halfHeight, Vector2(halfWidth, halfHeight), 0))
            ..friction =(0)
            ..isSensor = sensor;
  }

  @override
  Size? sizeFromWidgetTree(){
    return matchingWidgetKey.currentContext!.size;
  }
}


extension PolygonSize on PolygonShape {
  Size get size {
    final rectFromPoint = (Vector2 vec) => Rect.fromLTWH(vec.x.toPixels(), vec.y.toPixels(), 1, 1);
    return vertices
            .map((e) => rectFromPoint(e))
            .reduce((value, element) => value.expandToInclude(element))
            .size;
  }
}