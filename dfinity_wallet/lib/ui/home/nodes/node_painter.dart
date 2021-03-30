import 'dart:math';

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

    logTime("painting", () {
      nodes.forEach((node) {
        final smallestDistance = node.connectedNodes.map((element) => node.position.distanceTo(element.position)).min()! * 1.1;

        node.connectedNodes.filter((element) => element.respondsToForces).forEach((proximalNode) {

          final distance = node.position.distanceTo(proximalNode.position);
          final ratioOfSmallest = (smallestDistance / distance);
          final opacityMultiplier = ratioOfSmallest * ratioOfSmallest * ratioOfSmallest * ratioOfSmallest;

          final amountAboveLowest = ((node.charge + proximalNode.charge)/2) - lowestCharge;
          final opacity = min(1.0, opacityMultiplier) * (amountAboveLowest / (diff + 0.01)) * 0.2;

          canvas.drawLine(node.offset, proximalNode.offset,
              AppColors.white.withOpacity(opacity).paint
                ..style = PaintingStyle.stroke
                ..strokeWidth = 2
          );
        });
      });
    });

  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
