import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../../dfinity.dart';

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final maturity = neuron.maturityE8sEquivalent;
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Rewards",
                        style: context.textTheme.headline3,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Text(
                            "As your neuron matures, and you participate in governance, you gain rewards that can be used to spawn new neurons."),
                      )
                    ],
                  ),
                ),
                SizedBox(width: 24,),
                IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      BalanceDisplayWidget(
                          amount: neuron.maturityE8sEquivalent.toBigInt.toICPT,
                          amountSize: 30,
                          icpLabelSize: 15),
                      Expanded(child: ConstrainedBox(constraints: BoxConstraints(minHeight: 40),
                      child: Container())),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton(
                            onPressed: () {
                              Overlay.of(context)?.show(context,
                                  NewTransactionOverlay(
                                    rootTitle: "Spawn Neuron",
                                    rootWidget: StakeNeuronPage(source: neuron),
                                  )
                              );
                            }.takeIf((e) => neuron.maturityE8sEquivalent.toDouble() > 0),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Text("Spawn Neuron"),
                            )),
                      )
                    ],
                  ),
                )
              ],
            ),

          ],
        ),
      ),
    );
  }
}
