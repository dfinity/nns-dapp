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
                      proposal.status,
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
              style: context.textTheme.bodyText1,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SliderTheme(
              data: SliderThemeData(
                inactiveTrackColor: Color(0xffED1E79),
                activeTrackColor: Color(0xff80ACF8),
                thumbColor: Colors.transparent,
              ),
              child: Slider(
                value: proposal.yes.toDouble(),
                min: 0,
                max: proposal.yes.toDouble() + proposal.no.toDouble(),
                divisions: 1000,
                onChanged: (e) {},
              ),
            ),
          ),
          if (votedNeurons.isNotEmpty)
            Card(
              color: AppColors.gray400.withOpacity(0.1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    "My Votes",
                    style: context.textTheme.bodyText1,
                  ),
                  ...votedNeurons.map((e) {
                    final vote = e.voteForProposal(proposal);
                    final image = (vote == Vote.YES) ? "assets/thumbs_up.svg" : "assets/thumbs_down.svg";
                    return Row(
                        children: [
                          Expanded(
                            child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Text(e.id)),
                          ),
                          Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                  "${e.votingPower.toBigInt.toICPT.toStringAsFixed(2)}")),
                          SvgPicture.asset(image)
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
