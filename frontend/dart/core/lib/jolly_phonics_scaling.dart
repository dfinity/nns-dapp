import 'package:flutter/cupertino.dart';

extension Scaling on BuildContext {
  /// Size relative to the `height` of the screen.
  double? sy(double value) {
    return ClassroomScaler.of(this).sy(value);
  }

  /// Size relative to the `width` of the screen.
  double? sx(double value) {
    return ClassroomScaler.of(this).sx(value);
  }
}

class ScalingCalculatorParent extends StatefulWidget {
  final Widget? child;

  const ScalingCalculatorParent({Key? key, this.child}) : super(key: key);

  @override
  _ScalingCalculatorParentState createState() => _ScalingCalculatorParentState();
}

class _ScalingCalculatorParentState extends State<ScalingCalculatorParent> {
  double? width;
  double? height;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    width = size.width;
    height = size.height;
    return ClassroomScaler(
      width: width,
      height: height,
      child: widget.child!,
    );
  }
}

class ClassroomScaler extends InheritedWidget {
  final double? width;
  final double? height;

  const ClassroomScaler({
    Key? key,
    required this.width,
    required this.height,
    required Widget child,
  })  : assert(child != null),
        super(key: key, child: child);

  static of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ClassroomScaler>();
  }

  /// `RelativeScale.screenHeight` -> the height of the screen.
  double? get screenHeight => height;

  /// `RelativeScale.screenWidth` -> the width of the screen.
  double? get screenWidth => width;

  /// Size relative to the `height` of the screen.
  double sy(double value) {
    return (screenHeight! * _calculate(value)).roundToDouble();
  }

  /// Size relative to the `width` of the screen.
  double sx(double value) {
    return (screenWidth! * _calculate(value)).roundToDouble();
  }

  double _calculate(double value) {
    return (value / 100) / 5.333333333333333;
  }

  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) {
    return false;
  }
}
