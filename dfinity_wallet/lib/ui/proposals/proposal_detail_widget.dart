import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/proposals/proposal_state_card.dart';

import '../../dfinity.dart';
import 'cast_vote_widget.dart';

class ProposalDetailWidget extends StatefulWidget {
  final Proposal proposal;

  const ProposalDetailWidget(this.proposal, {Key? key}) : super(key: key);

  @override
  _ProposalDetailWidgetState createState() => _ProposalDetailWidgetState();
}

class _ProposalDetailWidgetState extends State<ProposalDetailWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Proposal"),
          backgroundColor: AppColors.background,
        ),
        body: Container(
            color: AppColors.lightBackground,
            child: StreamBuilder<Object>(
                stream: context.boxes.proposals.watch(key: widget.proposal.id),
                builder: (context, snapshot) {
                  final latestProposal =
                  context.boxes.proposals.get(widget.proposal.id);
                  return StreamBuilder(
                      stream: context.boxes.neurons.watch(),
                      builder: (context, snapshot) {
                        final updatedNeurons =
                        context.boxes.neurons.values.toList();

                        final ineligibleNeurons = updatedNeurons.filter(
                                (element) =>
                                element.createdTimestampSeconds
                                    .secondsToDateTime()
                                    .isAfter(widget.proposal.proposalTimestamp))
                            .toList();

                        final notVotedNeurons = updatedNeurons
                            .filter((element) =>
                        element.voteForProposal(widget.proposal) ==
                            null && !ineligibleNeurons.contains(element))
                            .toList();

                        return ConstrainWidthAndCenter(
                            child: SingleChildScrollView(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SmallFormDivider(),
                                  ProposalStateCard(
                                      proposal: latestProposal!,
                                      neurons: updatedNeurons),
                                  if (notVotedNeurons.isNotEmpty &&
                                      widget.proposal.status ==
                                          ProposalStatus.Open)
                                    CastVoteWidget(
                                      proposal: latestProposal,
                                      neurons: notVotedNeurons,
                                    ),
                                  if(ineligibleNeurons.isNotEmpty &&
                                      widget.proposal.status ==
                                          ProposalStatus.Open)
                                    IneligibleNeuronsWidget(ineligibleNeurons: ineligibleNeurons)
                                ],
                              ),
                            ));
                      });
                })));
  }
}


class IneligibleNeuronsWidget extends StatelessWidget {

  final List<Neuron> ineligibleNeurons;

  const IneligibleNeuronsWidget({Key? key, required this.ineligibleNeurons}) : super(key: key);

  @override
  Widget build(BuildContext context) {
  return Card(
    color: AppColors.background,
    child: Container(
      padding: EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Ineligible Neurons",
              style: context.textTheme.headline3),
          SmallFormDivider(),
          Text("The following neurons were created after the proposal was submitted, and are not able to vote on it",
              style: context.textTheme.bodyText2),
          ...ineligibleNeurons
              .map((e) => Container(
            child: Row(
              children: [
                Expanded(
                  child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(e.identifier)),
                ),
              ],
            ),
          )),
        ],
      ),
    ),
  );
  }
}
