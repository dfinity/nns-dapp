import 'dart:convert';

import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'package:url_launcher/url_launcher.dart';

class ProposalStateCard extends StatelessWidget {
  final Proposal proposal;
  final List<Neuron> neurons;

  const ProposalStateCard(
      {Key? key, required this.proposal, required this.neurons})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final votedNeurons = neurons
        .filter((element) => element.voteForProposal(proposal) != null)
        .toList();
    JsonEncoder encoder = new JsonEncoder.withIndent('  ');
    String prettyprint = encoder.convert(proposal.action);
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  proposal.summary,
                  style: context.textTheme.headline3,
                ),
                Expanded(
                  child: Container(),
                ),
                Container(
                  decoration: ShapeDecoration(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side:
                              BorderSide(width: 2, color: Color(0xffFBB03B)))),
                  child: Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      proposal.status.description,
                      style: TextStyle(
                          fontSize: 24,
                          fontFamily: Fonts.circularBook,
                          color: Color(0xffFBB03B),
                          fontWeight: FontWeight.normal),
                    ),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () { launch(proposal.url); },
              child: Text(
                proposal.url,
                style: context.textTheme.subtitle2?.copyWith(color: Colors.blue),
              ),
            ),
            Text(
              "Proposer: ${proposal.proposer}",
              style: context.textTheme.subtitle2,
            ),
            SmallFormDivider(),
            Text(
              "${prettyprint}",
              style: context.textTheme.subtitle2,
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: Row(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                    "Adopt",
                                  style: context.textTheme.headline3,
                                ),
                                Text(
                                  "${proposal.yes}",
                                  style: context.textTheme.headline4,
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            flex: proposal.yes,
                            child: SizedBox(
                              height: 10,
                              child: Container(
                                  color: Color(0xffED1E79),
                                ),
                            ),
                          ),
                          Expanded(
                            flex: proposal.no,
                            child: SizedBox(
                              height: 10,
                              child: Container(
                                  color: Color(0xff80ACF8),
                                ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                    "Reject",
                                  style: context.textTheme.headline3,
                                ),
                                Text(
                                  "${proposal.no}",
                                  style: context.textTheme.headline4,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (votedNeurons.isNotEmpty)
              Container(
                margin: EdgeInsets.only(top: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.gray600, width: 2),
                  borderRadius: BorderRadius.circular(10)
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Text(
                        "My Votes",
                        style: context.textTheme.subtitle1,
                      ),
                    ),
                    ...votedNeurons.map((e) {
                      final vote = e.voteForProposal(proposal);
                      final image = (vote == Vote.YES)
                          ? "assets/thumbs_up.svg"
                          : "assets/thumbs_down.svg";
                      final color = (vote == Vote.YES)
                          ? Color(0xff80ACF8)
                          : Color(0xffED1E78);

                      return Row(
                        children: [
                          Expanded(
                            child: Padding(
                                padding: EdgeInsets.all(16.0), child: Text(e.id)),
                          ),
                          Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                  "${e.votingPower.toBigInt.toICPT.toStringAsFixed(2)}", style: context.textTheme.subtitle2,)),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: SizedBox.fromSize(
                              child: SvgPicture.asset(
                                image,
                                color: color,
                              ),
                              size: Size.square(30),
                            ),
                          )
                        ],
                      );
                    })
                  ],
                ),
              )
          ],
        ),
      ),
    );
  }
}
