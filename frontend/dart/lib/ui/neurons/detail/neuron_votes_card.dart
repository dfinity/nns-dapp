import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neurons/detail/proposal_summary_widget.dart';
import '../../../dfinity.dart';

class NeuronVotesCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronVotesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.proposals.changes,
        builder: (context, snapshot) {
          return Card(
            color: AppColors.background,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Voting History",
                    style: Responsive.isMobile(context)
                        ? context.textTheme.headline6
                        : context.textTheme.headline3,
                  ),
                  SmallFormDivider(),
                  if (neuron.recentBallots.isEmpty)
                    Center(
                        child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        "no recent ballots",
                        style: context.textTheme.bodyText1,
                      ),
                    )),
                  if (neuron.recentBallots.isNotEmpty)
                    ...neuron.recentBallots
                        .distinctBy((element) => element.proposalId)
                        .map((e) {
                      return Container(
                        padding: EdgeInsets.all(8),
                        child: Row(
                          children: [
                            Expanded(
                                child: ProposalSummaryWidget(
                                    proposalId: e.proposalId.toBigInt)),
                            Text(e.vote.toString().removePrefix("Vote."),
                                style: context.textTheme.headline4)
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          );
        });
  }
}
