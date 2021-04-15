import '../../dfinity.dart';

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
    return Card(
      color: AppColors.background,
      child: Column(
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
              Expanded(
                child: Container(),
              ),
              Padding(
                padding: EdgeInsets.all(8.0),
                child: Container(
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
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              "By: ${proposal.proposer}",
              style: context.textTheme.bodyText2,
            ),
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
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                              "Yes",
                            style: context.textTheme.headline3,
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
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                              "No",
                            style: context.textTheme.headline3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      SizedBox(width: 5,),
                      Text(
                          "${proposal.yes}",
                        style: context.textTheme.headline4,
                      ),
                      Expanded(child: Container()),
                      SizedBox(width: 5,),
                      Text(
                          "${proposal.no}",
                        style: context.textTheme.headline4,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (votedNeurons.isNotEmpty)
            Card(
              color: AppColors.gray400.withOpacity(0.1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Text(
                      "My Votes",
                      style: context.textTheme.bodyText1,
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
                                "${e.votingPower.toBigInt.toICPT.toStringAsFixed(2)}")),
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
    );
  }
}
