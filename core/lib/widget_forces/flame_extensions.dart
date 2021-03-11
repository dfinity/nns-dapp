import 'dart:math';
import 'dart:ui';

import 'package:forge2d/forge2d.dart';
import 'package:dartx/dartx.dart';
import 'package:flutter/material.dart';

extension ToRect on Size {
    Rect get bounds => Rect.fromLTRB(0, 0, width, height);

    Offset get center => Offset(width / 2, height / 2);
}

extension Direction on Vector2 {
    Vector2 directionTo(Vector2 otherVector) => clone()
        ..sub(otherVector)
        ..normalize();

    Vector2 forceFromChargeAtPosition(double mass, Vector2 pos,
            {double originRadius = 0}) {
        var distanceTo = (this.distanceTo(pos) - originRadius);
        var distanceToSquared = distanceTo * distanceTo;
        if (distanceToSquared < 0.1) {
            distanceToSquared = 0.1;
        }
        var influence = mass / distanceToSquared;
        return this.directionTo(pos)..scale(influence);
    }
}

const double PIXELS_PER_METER = 30;
const double METERS_PER_PIXEL = 1 / 30;

extension MeterConversion on double {
    double toMeters() => this * METERS_PER_PIXEL;

    double toPixels() => this * PIXELS_PER_METER;
}

extension ToWorld on Offset {
    Vector2 toWorldVector() =>
            Vector2(dx / PIXELS_PER_METER, dy / PIXELS_PER_METER);

    Vector2 asVector() => Vector2(dx, dy);

    double distanceTo(Offset offset) => sqrt(distanceToSquared(offset));

    /// Squared distance from [this] to [arg]
    double distanceToSquared(Offset arg) {
        final double dx = this.dx - arg.dx;
        final double dy = this.dy - arg.dy;

        return dx * dx + dy * dy;
    }
}

extension ToPosition on Vector2 {
    Offset toOffset() => Offset(x * PIXELS_PER_METER, y * PIXELS_PER_METER);

    Offset asOffset() => Offset(x, y);
}

extension Combine on Iterable<Vector2> {
    Vector2 combine() {
        if (this.isEmpty) {
            return Vector2.zero();
        } else if (this.length == 1) {
            return this.first;
        } else {
            return reduce((vec1, vec2) => vec1.clone()..add(vec2));
        }
    }
}

extension CombineOffsets on Iterable<Offset> {
    Offset combine() {
        if (this.isEmpty) {
            return Offset.zero;
        } else if (this.length == 1) {
            return this.first;
        } else {
            return reduce((vec1, vec2) => vec1 + vec2);
        }
    }
}



extension RectHelpers on Rect {
    Rect translateByOffset(Offset offset) => translate(offset.dx, offset.dy);

    Rect translateByVector(Vector2 vector2) => translate(vector2.x, vector2.y);

    Rect scaleSize(double scale) =>
            RectHelper.fromCenter(center: center, width: width * scale, height: height * scale);


    Rect scale(double scale) =>
            Rect.fromLTWH(left * scale, top * scale, width * scale, height * scale);

    Vector2 get randomVectorInside => Vector2(left + random.nextInt(right.toInt()), top + rand.nextInt(bottom.toInt()));

    Rect get toMeterRect => Rect.fromLTWH(left.toMeters(), top.toMeters(), width.toMeters(), height.toMeters());
}

final Random random = Random();
final Random rand = Random();

extension RandomValue on Range<int> {
    int randomValue() =>
            (this.start + (random.nextDouble() * (endInclusive - start))).round();
}

extension Halving on double {
    double get half => this * 0.5;

    double get doubled => this * 2;
}

extension HalvingInt on int {
    double get half => this * 0.5;
}

extension FromOffsetAndSize on Rect {
    static Rect fromCenterAndSize(Offset center, Size size) =>
            RectHelper.fromCenter(
                    center: center, width: size.width, height: size.height);
}

class RectHelper {
    static Rect fromCenter({Offset center, double width, double height}) =>
            Rect.fromLTRB(
                center.dx - width / 2,
                center.dy - height / 2,
                center.dx + width / 2,
                center.dy + height / 2,
            );
}

extension CombineRects on Iterable<Rect> {
    Rect combined() => reduce((value, element) => value.expandToInclude(element));
}

extension Bounds on Iterable<Path> {
    Rect getBounds() => map((e) => Path.from(e).getBounds())
            .reduce((value, element) => value.expandToInclude(element));
}

extension Mass on CircleShape {
    double densityForMass(double mass) => mass / (pi * radius * radius);
}

extension RandomElement<T> on List<T> {
    T random() => this[rand.nextInt(length)];
}

extension Wait on Duration {
    Future<void> wait() => Future.delayed(this);
}
