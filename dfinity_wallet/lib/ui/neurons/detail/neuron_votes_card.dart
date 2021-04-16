import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../../dfinity.dart';

class NeuronVotesCard extends StatelessWidget {

  final Neuron neuron;

  const NeuronVotesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
      stream: context.boxes.proposals.watch(),
      builder: (context, snapshot) {
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
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 0.0),
                  child: Text(
                      "Below is a list of votes undertaken by this neuron"),
                ),
                SmallFormDivider(),
                ...neuron.recentBallots.distinctBy((element) => element.proposalId).map((e) {
                  final proposal = context.boxes.proposals.get(e.proposalId);
                  if(proposal == null){
                    // context.icApi.
                  }
                  return Container(
                    padding: EdgeInsets.all(8),
                  child: Row(
                    children: [
                      Text(proposal?.summary ?? e.proposalId),
                      Expanded(child: Container()),
                      Text(e.vote.toString().removePrefix("Vote."))
                    ],
                  ),
                );
                }),
              ],
            ),
          ),
        );
      }
    );
  }
}


