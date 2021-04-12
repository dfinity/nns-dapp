import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:dartx/dartx.dart';


extension FetchMediaQuery on BuildContext{
  MediaQueryData get mediaQuery => MediaQuery.of(this);
}

extension ProportionalSizing on MediaQueryData {

  double get smallPadding => size.shortestSide * 0.01;
  double get mediumPadding => size.shortestSide * 0.02;
  double get largePadding => size.shortestSide * 0.03;

}



extension Navigation on BuildContext {
  push(Widget widget) {
    Navigator.push(this, MaterialPageRoute(builder: (context) => widget));
  }

  NavigatorState get navigator => Navigator.of(this);
}

extension PushRoute on NavigatorState {
  void pushNamedRouteAndClear(String route) => pushNamedAndRemoveUntil(route, (route) => false);
}

extension ShuffledMovingAll<T> on List<T?> {
  List<T?> shuffleList() {
    List<T?> temp = this.toList();
    List<T?> list = this.toList();
    var rnd = Random();

    for (int i = 0; i < list.length; i++) {
      int newPos = (i == 0) ? rnd.nextInt(list.length) : list.lastIndex;
      while (newPos == i || temp.elementAt(newPos) == null) {
        newPos = rnd.nextInt(list.length);
      }
      list[i] = temp[newPos];
      temp[newPos] = null;
    }
    return list;
  }
}

extension Frame on GlobalKey {
  Rect get frame {
    final size = currentContext!.size!;
    final pos = position;
    return Rect.fromLTWH(pos.dx, pos.dy, size.width, size.height);
  }

  Offset get position {
    final box = currentContext!.findRenderObject() as RenderBox;
    return box.localToGlobal(Offset.zero);
  }

  bool get attached => (currentContext?.findRenderObject() != null);
}

extension Positions<T> on List<T> {
  bool isLast(T object) => indexOf(object) == (length - 1);

  T next(T object) => this[indexOf(object) + 1];

  T? getOrNull(int index) {
    if (index >= length || index < 0) return null;
    return this[index];
  }
}

extension Logging<T> on T {
  T logValue(String message) {
    print("$message $this");
    return this;
  }
}

extension NoNulls<T> on Iterable<T>{
  List<T> get listNotNull => this.filterNotNull().toList();
}

extension MapToList<T> on Iterable<T>{
  List<R> mapToList<R>(R Function(T e) func) => map((e) => func(e)).toList();
}

extension Interspace<T extends Widget> on Iterable<T> {
  Iterable<Widget> interspace(Widget spacer) {
    return this.mapIndexed((index, element) => <Widget>[if(index != 0) spacer,  element]).flatten();
  }
}

extension StandardKotlin<T> on T {
  /// Calls the specified function [block] with `this` value as its argument and returns its result.
  @pragma('vm:prefer-inline')
  @pragma('dart2js:tryInline')
  R let<R>(R Function(T) block) {
    assert(() {
      if (block == null) throw ArgumentError("block can't be null");
      return true;
    }());
    return block(this as T);
  }

  @pragma('vm:prefer-inline')
  @pragma('dart2js:tryInline')
  T also(void Function(T) block) {
    assert(() {
      if (block == null) throw ArgumentError("block can't be null");
      return true;
    }());
    block(this as T);
    return this as T;
  }

  @pragma('vm:prefer-inline')
  @pragma('dart2js:tryInline')
  T? takeIf(bool Function(T) predicate) {
    assert(() {
      if (predicate == null) throw ArgumentError("predicate can't be null");
      return true;
    }());
    if (predicate(this as T)) return this as T;
    return null;
  }

  @pragma('vm:prefer-inline')
  @pragma('dart2js:tryInline')
  T? takeUnless(bool Function(T) predicate) {
    assert(() {
      if (predicate == null) throw ArgumentError("predicate can't be null");
      return true;
    }());
    if (!predicate(this as T)) return this as T;
    return null;
  }
}


extension NotNullMap<T> on Iterable<T>?{
  List<R> map<R>(R Function(T e) func) => this?.map((e) => func(e)).toList() ?? [];
}

