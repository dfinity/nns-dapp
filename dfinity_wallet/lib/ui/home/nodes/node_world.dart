import 'package:core/widget_forces/game_loop.dart';

import '../../../dfinity.dart';
import 'node_distributor.dart';

class NodeWorld extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: LayoutBuilder(builder: (context, constraints) {
        return SizedBox.expand(
          child: NodeDistributor(
              Rect.fromCenter(
                  center: Offset(constraints.maxWidth * METERS_PER_PIXEL * 0.5, constraints.maxHeight * METERS_PER_PIXEL * 0.5),
                  width: constraints.maxWidth * METERS_PER_PIXEL * 1.5,
                  height: constraints.maxHeight * METERS_PER_PIXEL * 1.5),
              75),
        );
      }),
    );
  }
}
