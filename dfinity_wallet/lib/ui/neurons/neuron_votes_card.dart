import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../dfinity.dart';

class NeuronVotesCard extends StatelessWidget {

  final Neuron neuron;

  const NeuronVotesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text("Voting",
                      style: context.textTheme.headline3),
                ),
                LabelledBalanceDisplayWidget(
                    amount: neuron.votingPower.toBigInt.toICPT,
                    amountSize: 30,
                    icpLabelSize: 15,
                    text: Text("Voting Power")
                )
              ],
            ),
            ...neuron.recentBallots.map((e) {
              final proposal = context.boxes.proposals.get(e);
              return Container(
              child: Row(
                children: [
                  Column(
                    children: [
                      Text(proposal?.text ?? ""),
                      Text(e.proposalId),
                    ],
                  ),
                  Expanded(child: Container()),
                  Text(e.vote.toString())
                ],
              ),
            );
            })
          ],
        ),
      ),
    );
  }
}
