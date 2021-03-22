import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';

class GovernanceTabWidget extends StatefulWidget {
    @override
    _GovernanceTabWidgetState createState() => _GovernanceTabWidgetState();
}

class _GovernanceTabWidgetState extends State<GovernanceTabWidget> {

    List<Proposal> proposals = [];

    @override
  void initState() {
    super.initState();

    proposals = [];
  }

    @override
    Widget build(BuildContext context) {
        return ConstrainWidthAndCenter(child:
           TabTitleAndContent(title: "Governance", children: [Container(
              child: Center(
                  child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 100.0),
                      child: SizedBox(
                          width: 400,
                          height: 400,
                          child: Text(
                              "The Internet Computer is Governed by Neurons. \n\nVoting power is determined by long term stakes in neurons.  \n\n Select a proposal below to vote on it.",
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


