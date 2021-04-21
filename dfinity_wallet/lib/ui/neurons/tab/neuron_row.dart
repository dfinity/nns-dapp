
import '../../../dfinity.dart';

class NeuronRow extends StatelessWidget {
  final Neuron neuron;
  final bool showsWarning;
  final VoidCallback onPressed;

  const NeuronRow(
      {Key? key,
        required this.neuron,
        required this.onPressed,
        this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    SelectableText(
                      neuron.address,
                      style: context.textTheme.headline3,
                    ),

                  ],
                ),
              ),
              Expanded(child: Container()),
              BalanceDisplayWidget(
                amount: neuron.stake.toICPT,
                amountSize: 30,
                icpLabelSize: 15,
              )
            ],
          ),
        ),
      ),
    );
  }
}