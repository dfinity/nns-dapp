import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';

class NeuronsTabWidget extends StatefulWidget {
  @override
  _NeuronsTabWidgetState createState() => _NeuronsTabWidgetState();
}

class _NeuronsTabWidgetState extends State<NeuronsTabWidget> {
  @override
  Widget build(BuildContext context) {
    return ConstrainWidthAndCenter(
      child: TabTitleAndContent(title: "Neurons", children: [Container(
        child: Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 100.0),
            child: SizedBox(
              width: 400,
              height: 400,
              child: Text(
                "Neurons are long term stores of ICP.\n\n Storing ICP in neurons earns rewards.\n\n ICP stored in neurons give you power to vote on proposals.",
                style: context.textTheme.bodyText1,
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
      )],),
    );
  }
}


