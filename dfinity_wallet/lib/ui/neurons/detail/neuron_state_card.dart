import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/tab/neuron_row.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/select_transaction_type_widget.dart';
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
            NeuronRow(neuron: neuron),
            VerySmallFormDivider(),
            Align(
                alignment: Alignment.bottomRight,
                child: buildStateButton(context))
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
                backgroundColor: MaterialStateProperty.all(AppColors.blue600)),
            onPressed: () async {
              context.performLoading(() =>
                  context.icApi.stopDissolving(neuronId: neuron.id.toBigInt));
            });
      case NeuronState.LOCKED:
        return ElevatedButton(
            style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all(AppColors.yellow500),
            ),
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
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Disburse"),
            ),
            onPressed: () {
              Overlay.of(context)!.show(context, NewTransactionOverlay(
                rootTitle: 'Manage ICP',
                rootWidget: SelectAccountTransactionTypeWidget(source: neuron,),
              ));
            });
      case NeuronState.UNSPECIFIED:
        return ElevatedButton(child: Text(""), onPressed: () {});
    }
  }
}
