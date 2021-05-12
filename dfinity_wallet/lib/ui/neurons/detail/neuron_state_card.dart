import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/tab/neuron_row.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/select_transaction_type_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../../dfinity.dart';
import '../increase_dissolve_delay_widget.dart';

class NeuronStateCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronStateCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.mediumBackground,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            NeuronRow(neuron: neuron),
            RichText(
                text: TextSpan(style: context.textTheme.subtitle2, children: [
                  TextSpan(
                      text: neuron.createdTimestampSeconds
                          .secondsToDateTime()
                          .dayFormat,
                      style: context.textTheme.subtitle2),
                  TextSpan(text: " - Staked"),
                ])),
            VerySmallFormDivider(),
            Row(
              children: [
                Expanded(child: Container(),),
                ElevatedButton(
                    onPressed: () {
                      OverlayBaseWidget.show(context, WizardOverlay(
                          rootTitle: "Increase Dissolve Delay",
                          rootWidget:
                          IncreaseDissolveDelayWidget(neuron: neuron, onCompleteAction: (context) {
                            OverlayBaseWidget.of(context)?.dismiss();
                          })));
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Text("Increase Dissolve Delay"),
                    )),
                SizedBox(width: 8),
                buildStateButton(context),
              ],
            )
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
              context.callUpdate(() =>
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
              context.callUpdate(() =>
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
              OverlayBaseWidget.show(
                  context,
                  WizardOverlay(
                    rootTitle: 'Disburse Neuron',
                    rootWidget: SelectDestinationAccountPage(
                      source: neuron,
                    ),
                  ));
            });
      case NeuronState.UNSPECIFIED:
        return ElevatedButton(child: Text(""), onPressed: () {});
    }
  }
}
