import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/neuron_followees_card.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_rewards_card.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_state_card.dart';
import 'package:dfinity_wallet/ui/neurons/proposal/neuron_proposals_card.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';


import '../../../dfinity.dart';
import 'neuron_votes_card.dart';

class NeuronDetailWidget extends StatefulWidget {
  final Neuron neuron;

  const NeuronDetailWidget(this.neuron, {Key? key}) : super(key: key);

  @override
  _NeuronDetailWidgetState createState() => _NeuronDetailWidgetState();
}

class _NeuronDetailWidgetState extends State<NeuronDetailWidget> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppColors.lightBackground,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          title: Text("Neuron"),
        ),
        body: StreamBuilder<Object>(
          stream: context.boxes.neurons.watch(key: widget.neuron.identifier),
          builder: (context, snapshot) {
            return SingleChildScrollView(
              child: ConstrainWidthAndCenter(
                child: Container(
                  color: AppColors.lightBackground,
                  child: Column(
                    children: [
                      SmallFormDivider(),
                      NeuronStateCard(neuron: widget.neuron),
                      NeuronRewardsCard(neuron: widget.neuron),
                      NeuronVotesCard(neuron: widget.neuron),
                      NeuronFolloweesCard(neuron: widget.neuron),
                      NeuronProposalsCard(neuron: widget.neuron),
                      TallFormDivider(),
                    ],
                  ),
                ),
              ),
            );
          }
        ));
  }
}

class _LabelledBalanceDisplay extends StatelessWidget {
  final String label;
  final double amount;

  const _LabelledBalanceDisplay(
      {Key? key, required this.label, required this.amount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              Text(label),
              BalanceDisplayWidget(
                amount: amount,
                amountSize: 50,
                icpLabelSize: 25,
              ),
            ],
          )),
    );
  }
}
