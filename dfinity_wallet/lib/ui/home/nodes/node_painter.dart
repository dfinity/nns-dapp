import 'package:core/core.dart';
import 'node.dart';

class NodePainter extends CustomPainter {
  final List<Node> nodes;

  NodePainter(this.nodes);

  @override
  void paint(Canvas canvas, Size size) {
    nodes.forEach((node) {
      canvas.drawCircle(node.offset, 5, AppColors.white.paint);

      node.proximityNodes.forEach((proximalNode) {
        canvas.drawLine(node.offset, proximalNode.offset,
            AppColors.white.withOpacity(0.6).paint
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1
        );
      });
    });
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
