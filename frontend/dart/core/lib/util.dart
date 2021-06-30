import 'dart:math';
import 'dart:ui';

import 'package:dartx/dartx.dart';
import 'package:flutter/material.dart';

extension ToRect on Size {
  Rect get bounds => Rect.fromLTRB(0, 0, width, height);

  Offset get center => Offset(width / 2, height / 2);
}

const double PIXELS_PER_METER = 30;
const double METERS_PER_PIXEL = 1 / 30;

extension MeterConversion on double {
  double toMeters() => this * METERS_PER_PIXEL;

  double toPixels() => this * PIXELS_PER_METER;
}

extension ToWorld on Offset {

  double distanceTo(Offset offset) => sqrt(distanceToSquared(offset));

  /// Squared distance from [this] to [arg]
  double distanceToSquared(Offset arg) {
    final double dx = this.dx - arg.dx;
    final double dy = this.dy - arg.dy;

    return dx * dx + dy * dy;
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

  Rect scaleSize(double scale) => RectHelper.fromCenter(
      center: center, width: width * scale, height: height * scale);

  Rect scale(double scale) =>
      Rect.fromLTWH(left * scale, top * scale, width * scale, height * scale);


  Rect get toMeterRect => Rect.fromLTWH(
      left.toMeters(), top.toMeters(), width.toMeters(), height.toMeters());
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
  static Rect fromCenter(
          {required Offset center,
          required double width,
          required double height}) =>
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

extension RandomElement<T> on List<T> {
  T random() => this[rand.nextInt(length)];
}

extension Wait on Duration {
  Future<void> wait() => Future.delayed(this);
}

T logTime<T>(String description, T Function() func) {
  final stopwatch = Stopwatch()..start();
  var output = func();
  print('$description in ${stopwatch.elapsed}');
  stopwatch.stop();
  return output;
}
