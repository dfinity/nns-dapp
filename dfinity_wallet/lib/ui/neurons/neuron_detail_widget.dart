import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/neuron_followees_card.dart';
import 'package:dfinity_wallet/ui/neurons/neuron_rewards_card.dart';
import 'package:dfinity_wallet/ui/neurons/neuron_state_card.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';


import '../../dfinity.dart';
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
            return ConstrainWidthAndCenter(
              child: Container(
                color: AppColors.lightBackground,
                child: ListView(
                  children: [
                    SmallFormDivider(),
                    NeuronStateCard(neuron: widget.neuron),
                    SmallFormDivider(),
                    NeuronRewardsCard(neuron: widget.neuron),
                    SmallFormDivider(),
                    NeuronVotesCard(neuron: widget.neuron),
                    SmallFormDivider(),
                    NeuronFolloweesCard(neuron: widget.neuron),
                  ],
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
