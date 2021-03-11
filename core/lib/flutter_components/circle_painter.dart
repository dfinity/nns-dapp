//circle_painter.dart
import 'package:core/app_colors.dart';
import 'package:flutter/material.dart';

class SelectionIndicator extends StatelessWidget {
  final bool? selected;

  const SelectionIndicator({Key? key, this.selected}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(18, 18),
      painter: DrawSelectionIndicator(selected),
    );
  }
}

class DrawSelectionIndicator extends CustomPainter {
  DrawSelectionIndicator(this.selected);

  final borderWidth = 2.0;
  final bool? selected;

  Color get color => colorForSelected(selected!);

  static Color colorForSelected(bool selected) =>
      selected ? AppColors.primaryBlue : AppColors.gray600;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(
        Offset(size.width / 2, size.height / 2),
        size.height / 2,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = borderWidth);

    if (selected!) {
      canvas.drawCircle(
          Offset(size.width / 2, size.height / 2),
          (size.height / 2) - (borderWidth * 1.5),
          Paint()
            ..color = color
            ..style = PaintingStyle.fill);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return true;
  }
}
