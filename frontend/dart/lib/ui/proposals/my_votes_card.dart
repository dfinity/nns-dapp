import '../../nns_dapp.dart';

class MyVotesCard extends StatelessWidget {
  final List<Neuron> votedNeurons;
  final Proposal proposal;

  const MyVotesCard(
      {Key? key, required this.votedNeurons, required this.proposal})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
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
                                "${proposal.yes.asString(minDecimals: 2, maxDecimals: 2)}",
                                style: context.textTheme.headline4,
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          flex: (proposal.yes.asDouble() * 1000).toInt(),
                          child: SizedBox(
                            height: 10,
                            child: Container(
                              color: Color(0xff80ACF8),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: (proposal.no.asDouble() * 1000).toInt(),
                          child: SizedBox(
                            height: 10,
                            child: Container(
                              color: Color(0xffED1E79),
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
                                "${proposal.no.asString(minDecimals: 2, maxDecimals: 2)}",
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
                  borderRadius: BorderRadius.circular(10)),
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
                              "${e.votingPower.asString(minDecimals: 2, maxDecimals: 2)}",
                              style: context.textTheme.subtitle2,
                            )),
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
            ),
        ],
      ),
    );
  }
}
