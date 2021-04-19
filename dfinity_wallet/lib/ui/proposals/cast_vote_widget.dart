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
                            child: Text(e.identifier)),
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
                      Overlay.of(context)?.show(
                          context,
                          ConfirmVoteWidget(
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
                      Overlay.of(context)?.show(
                          context,
                          ConfirmVoteWidget(
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

class ConfirmVoteWidget extends StatelessWidget {
  final String svg;
  final Color svgColor;
  final String title;
  final String description;
  final Function onConfirm;

  const ConfirmVoteWidget(
      {Key? key,
      required this.svg,
      required this.svgColor,
      required this.title,
      required this.description,
      required this.onConfirm})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 500),
      child: Container(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: SizedBox(
                    width: 50,
                    height: 50,
                    child: SvgPicture.asset(
                      svg,
                      color: svgColor,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(title, style: context.textTheme.headline3),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    description,
                    style: context.textTheme.bodyText2,
                    textAlign: TextAlign.center,
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.all(AppColors.gray800)),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text("Cancel"),
                          ),
                          onPressed: () {
                            OverlayBaseWidget.of(context)?.dismiss();
                          }),
                    ),
                    SizedBox(
                      width: 20,
                    ),
                    Expanded(
                      child: ElevatedButton(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text("Yes, I'm sure"),
                          ),
                          onPressed: () {
                            OverlayBaseWidget.of(context)?.dismiss();
                            onConfirm();
                          }),
                    )
                  ],
                )
              ]),
        ),
      ),
    );
  }
}
