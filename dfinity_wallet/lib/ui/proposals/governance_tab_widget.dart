import 'dart:async';

import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
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
            child: Padding(
              padding: const EdgeInsets.all(15.0),
              child: Text(
                "The Internet Computer is managed by ICP token-holders that have staked tokens in neurons, who propose and vote on upgrades to the protocol.",
                style: context.textTheme.bodyText2,
              ),
            ),
          ),
          SmallFormDivider(),
          ...context.boxes.proposals.values
              .groupBy((element) => element.proposalType)
              .entries
              .map((entry) => ProposalGroupCard(type: entry.key, proposals: entry.value))
              .interspace(SmallFormDivider()),
          SmallFormDivider()
        ],
      ),
    );
  }
}

class ProposalGroupCard extends StatelessWidget {

  final ProposalType type;
  final List<Proposal> proposals;

  const ProposalGroupCard({Key? key,
    required this.type,
    required this.proposals})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(type.description, style: context.textTheme.headline3,),
            ...highestPriorityProposals.take(3).map((e) =>
                ProposalRow(
                    proposal: e,
                    onPressed: () {
                      context.nav.push(ProposalPageDef.createPageConfig(e));
                    })),
            SmallFormDivider(),
            ElevatedButton(
                style: ButtonStyle(
                    backgroundColor:
                    MaterialStateProperty.all(AppColors.blue600),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)))),
                onPressed: () {
                  // Overlay.of(context)?.show(context,
                  //     NewProposalDialog(neuron: neuron)
                  // );
                },
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text("View All"),
                ))
          ],
        ),
      ),
    );
  }


  Iterable<Proposal> get highestPriorityProposals => proposals
      .groupBy((element) => element.status)
      .entries
      .sortedBy((element) => element.key.index)
      .flatMap((element) => element.value.sortedBy((element) => element.proposalTimestamp));
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
                    Text(
                      proposal.summary,
                      style: context.textTheme.bodyText1,
                    ),
                    Expanded(child: Container()),
                    Container(
                      decoration: ShapeDecoration(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                  width: 2, color: proposal.status.color))),
                      child: Padding(
                        padding: EdgeInsets.all(8.0),
                        child: Text(
                          proposal.status.description,
                          style: TextStyle(
                              fontSize: 24,
                              fontFamily: Fonts.circularBook,
                              color: proposal.status.color,
                              fontWeight: FontWeight.normal),
                        ),
                      ),
                    )
                  ],
                ),
                Text(
                  "By: ${proposal.proposer}",
                  style: context.textTheme.bodyText2,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
