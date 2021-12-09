import 'package:nns_dapp/ui/_components/constrain_width_and_center.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/proposals/proposal_state_card.dart';

import '../../nns_dapp.dart';
import 'cast_vote_widget.dart';
import 'my_votes_card.dart';

class ProposalDetailWidget extends StatefulWidget {
  final Proposal proposal;

  const ProposalDetailWidget(this.proposal, {Key? key}) : super(key: key);

  @override
  _ProposalDetailWidgetState createState() => _ProposalDetailWidgetState();
}

enum ProposalVotingEligibility {
  eligible,
  dissolveTooShort,
  createdSinceProposal
}

class _ProposalDetailWidgetState extends State<ProposalDetailWidget> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  void refreshProposal() {
    context.icApi
        .fetchProposal(proposalId: widget.proposal.identifier.toBigInt);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("Proposal", style: context.textTheme.headline3),
          backgroundColor: AppColors.background,
        ),
        body: Container(
            color: AppColors.lightBackground,
            child: StreamBuilder<Object>(
                stream: context.boxes.proposals.changes,
                builder: (context, snapshot) {
                  final latestProposal =
                      context.boxes.proposals[widget.proposal.id];
                  return StreamBuilder(
                      stream: context.boxes.neurons.changes,
                      builder: (context, snapshot) {
                        final updatedNeurons =
                            context.boxes.neurons.values.toList();

                        final ineligibleNeurons = updatedNeurons
                            .map((neuron) {
                              var eligibility =
                                  ProposalVotingEligibility.eligible;
                              if (neuron.createdTimestampSeconds
                                  .secondsToDateTime()
                                  .isAfter(widget.proposal.proposalTimestamp)) {
                                eligibility = ProposalVotingEligibility
                                    .createdSinceProposal;
                              } else if (!widget.proposal.ballots
                                  .containsKey(neuron.id)) {
                                eligibility =
                                    ProposalVotingEligibility.dissolveTooShort;
                              }
                              return [neuron, eligibility];
                            })
                            .filter((p) =>
                                p[1] != ProposalVotingEligibility.eligible)
                            .toList();

                        final notVotedNeurons = updatedNeurons
                            .filter((n) =>
                                n.voteForProposal(widget.proposal) == null &&
                                !ineligibleNeurons.map((p) => p[0]).contains(n))
                            .toList();

                        final votedNeurons = updatedNeurons
                            .filter((element) =>
                                element.voteForProposal(widget.proposal) !=
                                null)
                            .toList();

                        return ConstrainWidthAndCenter(
                            child: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SmallFormDivider(),
                              ProposalStateCard(
                                  proposal: latestProposal,
                                  neurons: updatedNeurons),
                              MyVotesCard(
                                votedNeurons: votedNeurons,
                                proposal: latestProposal,
                              ),
                              if (notVotedNeurons.isNotEmpty &&
                                  latestProposal.status == ProposalStatus.Open)
                                CastVoteWidget(
                                  proposal: latestProposal,
                                  neurons: notVotedNeurons,
                                ),
                              if (ineligibleNeurons.isNotEmpty &&
                                  latestProposal.status == ProposalStatus.Open)
                                IneligibleNeuronsWidget(
                                    ineligibleNeurons: ineligibleNeurons),
                              SmallFormDivider()
                            ],
                          ),
                        ));
                      });
                })));
  }
}

class IneligibleNeuronsWidget extends StatelessWidget {
  final List<List<dynamic>> ineligibleNeurons;

  const IneligibleNeuronsWidget({Key? key, required this.ineligibleNeurons})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: Container(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Ineligible Neurons", style: context.textTheme.headline3),
            SmallFormDivider(),
            Text(
                "The following neurons had a dissolve delay of less than 6 months at the time the proposal was submitted, or were created after the proposal was submitted, and therefore are not eligible to vote on it:",
                style: context.textTheme.subtitle2),
            SmallFormDivider(),
            Table(
                columnWidths: const <int, TableColumnWidth>{
                  0: FlexColumnWidth(),
                  1: IntrinsicColumnWidth(),
                },
                defaultVerticalAlignment: TableCellVerticalAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  ...ineligibleNeurons.map((p) => TableRow(children: [
                        Container(
                          height: 28,
                          child: Text(p[0].identifier,
                              style: context.textTheme.subtitle2),
                        ),
                        Container(
                            alignment: Alignment.bottomRight,
                            margin: const EdgeInsets.only(left: 20.0),
                            height: 28,
                            child: Text(p[1] ==
                                    ProposalVotingEligibility.dissolveTooShort
                                ? "dissolve delay < 6 months"
                                : "created after proposal"))
                      ]))
                ]),
          ],
        ),
      ),
    );
  }
}
