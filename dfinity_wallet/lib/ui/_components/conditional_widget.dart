
import '../../dfinity.dart';

class ConditionalWidget extends EitherWidget {
  ConditionalWidget({
    required Key key,
    required bool condition,
    required Widget child,
  }) : super(condition: condition, trueWidget: child, falseWidget: Container(width: 0, height: 0));
}

class EitherWidget extends StatelessWidget {
  final bool condition;
  final Widget trueWidget;
  final Widget falseWidget;

  const EitherWidget({
    Key? key,
    required this.condition,
    required this.trueWidget,
    required this.falseWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (this.condition) {
      return trueWidget;
    } else {
      return falseWidget;
    }
  }
}

class LazyEitherWidget extends StatelessWidget {
  final bool condition;
  final Widget Function() trueWidget;
  final Widget Function() falseWidget;

  const LazyEitherWidget({
    Key? key,
    required this.condition,
    required this.trueWidget,
    required this.falseWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (this.condition) {
      return trueWidget();
    } else {
      return falseWidget();
    }
  }
}


class LazyConditionalWidget extends LazyEitherWidget {
  LazyConditionalWidget({
    Key? key,
    required bool condition,
    required Widget Function() child,
  }) : super(condition: condition, trueWidget: child, falseWidget: () => Container(width: 0, height: 0));
}