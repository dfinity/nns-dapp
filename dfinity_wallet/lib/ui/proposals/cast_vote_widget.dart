import '../../dfinity.dart';
import 'confirm_vote_dialog.dart';

class CastVoteWidget extends StatefulWidget {
  final Proposal proposal;
  final List<Neuron> neurons;

  const CastVoteWidget(
      {Key? key, required this.proposal, required this.neurons})
      : super(key: key);

  @override
  _CastVoteWidgetState createState() => _CastVoteWidgetState();
}

class _CastVoteWidgetState extends State<CastVoteWidget> {
  List<Neuron>? selectedNeurons;

  @override
  Widget build(BuildContext context) {
    final neuronsWithoutVote = widget.neurons.filterNot((element) => element
        .recentBallots
        .any((element) => element.proposalId == widget.proposal.id));
    if (selectedNeurons == null) {
      selectedNeurons = neuronsWithoutVote.toList();
    }
    final numVotes = selectedNeurons!
        .sumBy((element) => element.icpBalance)
        .toStringAsFixed(2);
    return Card(
      color: AppColors.background,
      child: Container(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Text("Cast Vote", style: context.textTheme.headline3),
                ),
                Padding(
                    padding: EdgeInsets.all(4.0),
                    child: Text(
                      numVotes,
                      style: context.textTheme.headline2,
                    )),
                Padding(
                    padding: EdgeInsets.all(4.0),
                    child: Text(
                      "Votes",
                    )),
              ],
            ),
            ...widget.neurons.map((e) => Container(
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Checkbox(
                          value: selectedNeurons!.contains(e),
                          onChanged: (bool? value) {
                            setState(() {
                              if (value == true) {
                                selectedNeurons!.add(e);
                              } else {
                                selectedNeurons!.remove(e);
                              }
                            });
                          },
                        ),
                      ),
                      Expanded(
                        child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(e.identifier, style: context.textTheme.subtitle2,)),
                      ),
                      Padding(
                          padding: EdgeInsets.all(16.0),
                          child:
                              Text("${e.icpBalance.toStringAsFixed(2)} votes")),
                    ],
                  ),
                )),
            Row(
              children: [
                Expanded(
                    child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ElevatedButton(
                    onPressed: () {
                      OverlayBaseWidget.show(
                          context,
                          ConfirmVoteDialog(
                            svg: "assets/thumbs_up.svg",
                            svgColor: Color(0xff80ACF8),
                            title: "Accept Proposal",
                            description:
                            'You are about to cast ${numVotes} votes for this proposal, are you sure you want to proceed? ',
                            onConfirm: () {
                              castVote(Vote.YES);
                            },
                          ));
                    }.takeIf((e) => selectedNeurons!.isNotEmpty),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Approve"),
                    ),
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStateProperty.all(Color(0xff80ACF8))),
                  ),
                )),
                Expanded(
                    child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ElevatedButton(
                    onPressed: () {
                      OverlayBaseWidget.show(
                          context,
                          ConfirmVoteDialog(
                            svg: "assets/thumbs_down.svg",
                            svgColor: Color(0xffED1E79),
                            title: "Reject Proposal",
                            description:
                                'You are about to cast ${numVotes} votes against this proposal, are you sure you want to proceed? ',
                            onConfirm: () {
                              castVote(Vote.NO);
                            },
                          ));
                    }.takeIf((e) => selectedNeurons!.isNotEmpty),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Reject"),
                    ),
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStateProperty.all(Color(0xffED1E79))),
                  ),
                )),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void castVote(Vote vote) async {
    await context.performLoading(() async {
      await context.icApi.registerVote(
          neuronIds: selectedNeurons!.map((e) => e.id.toBigInt).toList(),
          proposalId: widget.proposal.id.toBigInt,
          vote: vote);
    });
    await context.icApi.fetchProposal(proposalId: widget.proposal.identifier.toBigInt);
  }
}
