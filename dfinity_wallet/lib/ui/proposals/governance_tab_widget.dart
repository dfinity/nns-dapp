import 'dart:async';

import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/proposals/proposal_detail_widget.dart';

class GovernanceTabWidget extends StatefulWidget {
  @override
  _GovernanceTabWidgetState createState() => _GovernanceTabWidgetState();
}

class _GovernanceTabWidgetState extends State<GovernanceTabWidget> {
  StreamSubscription? subs;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    subs?.cancel();
    subs = context.boxes.proposals.watch().listen((event) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
    subs?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return ConstrainWidthAndCenter(
        child: TabTitleAndContent(
          title: "Governance",
          children: [
            Container(
              child: Card(
                color: AppColors.black,
                child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: Text(
                    "The Internet Computer is Governed by Neurons. \n\nVoting power is determined by long term stakes in neurons.  \n\n Select a proposal below to vote on it.",
                    style: context.textTheme.bodyText1,
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ),
            ...context.boxes.proposals.values.map((e) => ProposalRow(
                proposal: e,
                onPressed: () {
                  context.nav.push(ProposalPageDef.createPageConfig(e));
                }))
          ],
      ),
    );
  }
}

class ProposalRow extends StatelessWidget {
  final Proposal proposal;
  final VoidCallback onPressed;

  const ProposalRow({Key? key, required this.proposal, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        proposal.summary,
                        style: context.textTheme.headline3,
                      ),
                    ),
                    Expanded(child: Container()),
                    Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Container(
                        decoration: ShapeDecoration(
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                                side: BorderSide(
                                    width: 2, color: Color(0xffFBB03B)))),
                        child: Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Text(
                            proposal.status,
                            style: TextStyle(
                                fontSize: 24,
                                fontFamily: Fonts.circularBook,
                                color: Color(0xffFBB03B),
                                fontWeight: FontWeight.normal),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: Text(
                    "By: ${proposal.proposer}",
                    style: context.textTheme.bodyText1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
