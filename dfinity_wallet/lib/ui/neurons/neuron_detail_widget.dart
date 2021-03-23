import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../dfinity.dart';

class NeuronDetailWidget extends StatefulWidget {
  final Neuron neuron;

  const NeuronDetailWidget({Key? key, required this.neuron}) : super(key: key);

  @override
  _NeuronDetailWidgetState createState() => _NeuronDetailWidgetState();
}

class _NeuronDetailWidgetState extends State<NeuronDetailWidget> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Neuron"),
      ),
      body: Container(
          color: AppColors.lightBackground,
          child: FooterGradientButton(
              body: ListView(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _LabelledBalanceDisplay(label: "Stake", amount: widget.neuron.stake,)
                      ),
                      Expanded(
                          child: _LabelledBalanceDisplay(label: "Reward", amount: widget.neuron.rewardAmount,)
                      ),
                    ],
                  ),
                  TallFormDivider(),
                  Center(child: Padding(
                      padding: EdgeInsets.all(40),
                    child: Text(widget.neuron.name, style: context.textTheme.headline2,),
                  )),
                  TallFormDivider(),
                  Card(
                    color: AppColors.black,
                    child: Column(
                      children: [
                        Text("Details"),
                        Text("State - ${widget.neuron.state}")
                      ],
                    ),
                  )
                ],
              ),
              footer: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: buildStateButton(),
                    ),
                    Expanded(
                      child: ElevatedButton(
                          child: Text("Receive Reward"),
                          onPressed: () {
                          }.takeIf((e) => widget.neuron.rewardAmount > 0)),
                    ),
                  ],
                ),
              ))),
    );
  }

  ElevatedButton buildStateButton() {
    switch(widget.neuron.state){

      case NeuronState.DISPERSING:
        return ElevatedButton(
            child: Text("Stop Dispersing"),
            onPressed: () {
              widget.neuron.timerIsActive = false;
              widget.neuron.save();
            });
      case NeuronState.LOCKED:
        return ElevatedButton(
            child: Text("Start Dispersing"),
            onPressed: () {
              widget.neuron.timerIsActive = true;
              widget.neuron.save();
            });
      case NeuronState.UNLOCKED:
        return ElevatedButton(
            child: Text("Send ICP"),
            onPressed: () {

            });
    }
  }
}


class _LabelledBalanceDisplay extends StatelessWidget {

  final String label;
  final double amount;

  const _LabelledBalanceDisplay({Key? key, required this.label, required this.amount}) : super(key: key);

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
