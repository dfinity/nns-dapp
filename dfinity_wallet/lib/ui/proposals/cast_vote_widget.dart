import '../../dfinity.dart';

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
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card(
        color: AppColors.background,
        child: Container(
          padding: EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Text("Cast Vote",
                            style: context.textTheme.headline3)),
                  ),
                  Padding(
                      padding: EdgeInsets.all(4.0),
                      child: Text(
                        selectedNeurons!
                            .sumBy((element) => element.icpBalance)
                            .toStringAsFixed(2),
                        style: context.textTheme.headline2,
                      )),
                  Padding(
                      padding: EdgeInsets.all(4.0),
                      child: Text(
                        "Votes",
                      )),
                ],
              ),
              ...context.boxes.neurons.values.map((e) => Container(
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
                              child: Text(e.identifier)),
                        ),
                        Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(
                                "${e.icpBalance.toStringAsFixed(2)} votes")),
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
                        castVote(Vote.YES);
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text("For"),
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
                        castVote(Vote.NO);
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text("Against"),
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
      ),
    );
  }

  void castVote(Vote vote) {
    context.performLoading(() async {
      await context.icApi.registerVote(
          neuronIds: selectedNeurons!.map((e) => e.id.toBigInt).toList(),
          proposalId: widget.proposal.id.toBigInt,
          vote: vote);
    });
  }
}
