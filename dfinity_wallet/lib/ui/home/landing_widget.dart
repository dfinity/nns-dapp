import 'package:core/core.dart';
import 'package:core/widget_forces/force_layout.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_distributor.dart';

import 'nodes/node_world.dart';

class LandingPageWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.black,
      child: Stack(
        children: [
          NodeWorld(),
          SizedBox.expand(
              child: FractionallySizedBox(
                  widthFactor: 0.2,
                  heightFactor: 0.2,
                  child: SizedBox.expand(
                      child: SvgPicture.asset("assets/dfinity_logo.svg")))),
        ],
      ),
    );
  }
}
