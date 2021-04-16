import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../../dfinity.dart';

class NeuronStateCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronStateCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: SelectableText(neuron.identifier,
                      style: context.textTheme.headline2),
                ),
                LabelledBalanceDisplayWidget(
                    amount: neuron.stake.toICPT,
                    amountSize: 30,
                    icpLabelSize: 15,
                    text: Text("Stake")
                )
              ],
            ),
            Text("Details", style: context.textTheme.headline3),
            SizedBox(
              height: 10,
            ),
            Text("Status: ${neuron.state.description}"),
            if (neuron.state == NeuronState.DISSOLVING)
              Text(
                  "Time Remaining ${neuron.durationRemaining.yearsDayHourMinuteSecondFormatted()}"),
            if (neuron.state == NeuronState.LOCKED)
              Text(
                  "Dissolve Delay ${neuron.dissolveDelay.yearsDayHourMinuteSecondFormatted()}"),
            SizedBox(
              height: 10,
            ),
            buildStateButton(context)
          ],
        ),
      ),
    );
  }

  ElevatedButton buildStateButton(BuildContext context) {
    switch (neuron.state) {
      case NeuronState.DISSOLVING:
        return ElevatedButton(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Lockup"),
            ),
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(AppColors.blue600),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)))),
            onPressed: () async {
              context.performLoading(() =>
                  context.icApi.stopDissolving(neuronId: neuron.id.toBigInt));
            });
      case NeuronState.LOCKED:
        return ElevatedButton(
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(AppColors.yellow500),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)))),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Start Unlock"),
            ),
            onPressed: () {
              context.performLoading(() =>
                  context.icApi.startDissolving(neuronId: neuron.id.toBigInt));
            });
      case NeuronState.UNLOCKED:
        return ElevatedButton(
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(AppColors.yellow500),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)))),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Dispurse"),
            ),
            onPressed: () {
              // Overlay.of(context)!.show(context, NewTransactionOverlay(
              //
              //   account: neuron,
              // ));
            });
      case NeuronState.UNSPECIFIED:
        return ElevatedButton(child: Text(""), onPressed: () {});
    }
  }
}
