import 'package:nns_dapp/data/icp.dart';

import '../../nns_dapp.dart';
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
        .fold(ICP.zero, (ICP curr, next) => curr + next.votingPower)
        .asString(minDecimals: 2, maxDecimals: 2);
    return Card(
      color: AppColors.background,
      child: Container(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              child: Text("Cast Vote", style: context.textTheme.headline3),
              alignment: Alignment.topLeft,
            ),
            Table(
                border: TableBorder(
                    bottom: BorderSide(
                        color: AppColors.mediumBackground, width: 1)),
                columnWidths: const <int, TableColumnWidth>{
                  0: IntrinsicColumnWidth(),
                  1: FlexColumnWidth(),
                  2: IntrinsicColumnWidth(),
                },
                children: [
                  TableRow(children: [
                    Container(margin: const EdgeInsets.only(top: 20.0)),
                    Container(margin: const EdgeInsets.only(top: 20.0)),
                    Container(margin: const EdgeInsets.only(top: 20.0))
                  ]),
                  TableRow(children: [
                    Container(
                        decoration:
                            BoxDecoration(color: AppColors.mediumBackground),
                        padding: const EdgeInsets.only(top: 4, bottom: 4),
                        margin: const EdgeInsets.only(bottom: 6),
                        child: Text("", style: context.textTheme.subtitle2)),
                    Container(
                        decoration:
                            BoxDecoration(color: AppColors.mediumBackground),
                        padding: const EdgeInsets.only(top: 4, bottom: 4),
                        margin: const EdgeInsets.only(bottom: 6),
                        child: Text("neurons",
                            style: context.textTheme.subtitle2)),
                    Container(
                        decoration:
                            BoxDecoration(color: AppColors.mediumBackground),
                        padding:
                            const EdgeInsets.only(top: 4, bottom: 4, right: 16),
                        margin: const EdgeInsets.only(bottom: 6),
                        alignment: Alignment.bottomRight,
                        child: Text("voting power",
                            style: context.textTheme.subtitle2)),
                  ]),
                  ...widget.neurons.map((n) => TableRow(children: [
                        Container(
                            margin: const EdgeInsets.only(bottom: 6, right: 10),
                            child: Checkbox(
                              value: selectedNeurons!.contains(n),
                              onChanged: (bool? value) {
                                setState(() {
                                  if (value == true) {
                                    selectedNeurons!.add(n);
                                  } else {
                                    selectedNeurons!.remove(n);
                                  }
                                });
                              },
                            )),
                        Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          alignment: Alignment.bottomLeft,
                          height: 28,
                          child: Text(n.identifier,
                              style: context.textTheme.subtitle2),
                        ),
                        Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            alignment: Alignment.bottomRight,
                            padding: const EdgeInsets.only(right: 16),
                            height: 28,
                            child: Text(n.votingPower
                                .asString(minDecimals: 2, maxDecimals: 2)))
                      ])),
                ]),
            Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(top: 8, right: 16),
                child: Row(children: [
                  Expanded(
                      child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          alignment: Alignment.bottomRight,
                          child: Text("total"))),
                  Text(numVotes, style: context.textTheme.subtitle2),
                ])),
            Row(
              children: [
                Expanded(
                    child: Padding(
                  padding: const EdgeInsets.only(right: 8.0, top: 20),
                  child: ElevatedButton(
                    onPressed: () {
                      OverlayBaseWidget.show(
                          context,
                          ConfirmVoteDialog(
                            svg: "assets/thumbs_up.svg",
                            svgColor: Color(0xff80ACF8),
                            title: "Adopt Proposal",
                            description:
                                'You are about to cast $numVotes votes for this proposal, are you sure you want to proceed? ',
                            onConfirm: () {
                              castVote(Vote.YES);
                            },
                          ));
                    }.takeIf((e) => selectedNeurons!.isNotEmpty),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Adopt"),
                    ),
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStateProperty.all(Color(0xff80ACF8))),
                  ),
                )),
                Expanded(
                    child: Padding(
                  padding: const EdgeInsets.only(left: 8.0, top: 20),
                  child: ElevatedButton(
                    onPressed: () {
                      OverlayBaseWidget.show(
                          context,
                          ConfirmVoteDialog(
                            svg: "assets/thumbs_down.svg",
                            svgColor: Color(0xffED1E79),
                            title: "Reject Proposal",
                            description:
                                'You are about to cast $numVotes votes against this proposal, are you sure you want to proceed? ',
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
    await context.callUpdate(() async {
      await context.icApi.registerVote(
          neuronIds: selectedNeurons!.map((e) => e.id.toBigInt).toList(),
          proposalId: widget.proposal.id.toBigInt,
          vote: vote);
    });
    await context.icApi
        .fetchProposal(proposalId: widget.proposal.identifier.toBigInt);
  }
}
