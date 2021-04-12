import 'dart:math';

import 'package:core/core.dart';
import 'node.dart';

class NodePainter extends CustomPainter {
  final List<Node> nodes;

  NodePainter(this.nodes);

  @override
  void paint(Canvas canvas, Size size) {
    var lowestCharge = nodes.minBy((e) => e.charge)!.charge;
    var highestCharge = nodes.maxBy((e) => e.charge)!.charge;
    var diff = (highestCharge - lowestCharge);

    nodes.forEach((node) {

        final amountAboveLowest =
           max(0.0, min(1.0 ,  (node.charge - lowestCharge) / (diff + 0.01)));
      canvas.drawCircle(node.offset, node.charge, Colors.white.withOpacity(amountAboveLowest).paint);

      //
      // node.connectedNodes
      //     .filter((element) => element.respondsToForces)
      //     .forEach((proximalNode) {
      //   final distance = node.position.distanceTo(proximalNode.position);
      //   final ratioOfSmallest = (smallestDistance / distance);
      //   final opacityMultiplier = ratioOfSmallest *
      //       ratioOfSmallest *
      //       ratioOfSmallest *
      //       ratioOfSmallest;
      //
      //   final amountAboveLowest =
      //       ((node.charge + proximalNode.charge) / 2) - lowestCharge;
      //   final opacity = min(1.0, opacityMultiplier) *
      //       (amountAboveLowest / (diff + 0.01)) *
      //       0.2;
      //
      //   canvas.drawLine(
      //       node.offset,
      //       proximalNode.offset,
      //       AppColors.white.withOpacity(opacity).paint
      //         ..style = PaintingStyle.stroke
      //         ..strokeWidth = 2);
      // });
    });
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
