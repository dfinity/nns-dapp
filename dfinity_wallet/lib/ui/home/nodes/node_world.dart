import 'package:core/widget_forces/game_loop.dart';
import 'package:dfinity_wallet/ui/home/nodes/node.dart';

import '../../../dfinity.dart';
import 'node_distributor.dart';
import 'dart:math';


class NodeWorld extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      child: LayoutBuilder(builder: (context, constraints) {
        final numCalculated = (constraints.maxHeight + constraints.maxWidth) / 30;
        final numNodes = min(75.0, numCalculated);
        return SizedBox.expand(
          child: NodeDistributor(
              Rect.fromCenter(
                  center: Offset(constraints.maxWidth * METERS_PER_PIXEL * 0.5, constraints.maxHeight * METERS_PER_PIXEL * 0.5),
                  width: constraints.maxWidth * METERS_PER_PIXEL * 1.8,
                  height: constraints.maxHeight * METERS_PER_PIXEL * 1.8),
              numNodes.toInt()),
        );
      }),
    );
  }
}
