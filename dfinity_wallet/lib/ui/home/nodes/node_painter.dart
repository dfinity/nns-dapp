import 'package:core/core.dart';
import 'node.dart';

class NodePainter extends CustomPainter {
  final List<Node> nodes;

  NodePainter(this.nodes);

  @override
  void paint(Canvas canvas, Size size) {
    final lowestCharge = nodes.minBy((e) => e.charge)!.charge;
    final highestCharge = nodes.maxBy((e) => e.charge)!.charge;
    final diff = highestCharge - lowestCharge;

    nodes.forEach((node) {
      node.connectedNodes.filter((element) => element.respondsToForces).forEach((proximalNode) {

        final amountAboveLowest = (node.charge + proximalNode.charge)/2 - lowestCharge;
        final opacity = (amountAboveLowest / (diff + 0.1)) * 0.1;

        canvas.drawLine(node.offset, proximalNode.offset,
            AppColors.white.withOpacity(opacity).paint
              ..style = PaintingStyle.stroke
              ..strokeWidth = 2
        );
      });
    });

  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
