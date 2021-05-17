import 'package:dfinity_wallet/ic_api/web/web_ic_api.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/neurons/detail/neuron_detail_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../../dfinity.dart';
import '../stake_neuron_page.dart';

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Maturity",
                        style: context.textTheme.headline3,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Text(
                          "When your neuron votes, its maturity increases. This allows you to spawn a new neuron containing newly minted ICP. Increases in maturity can occur up to 3 days after voting took place.", style: context.textTheme.subtitle2,),
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
                          amount: neuron.maturityE8sEquivalent.toBigInt / neuron.stake,
                          amountSize: 30,
                          icpLabelSize: 0,
                          amountLabelSuffix: "%"),
                      Expanded(child: ConstrainedBox(constraints: BoxConstraints(minHeight: 40),
                      child: Container())),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton(
                            onPressed: () {
                              OverlayBaseWidget.show(context, ConfirmDialog(
                                title: "Really Spawn Neuron",
                                description: "Are you sure you wish to spawn a new neuron?",
                                onConfirm: () async {
                                  context.callUpdate(() async {
                                    final newNeuron = await context.icApi.spawnNeuron(neuronId: neuron.identifier.toBigInt);
                                    context.nav.push(NeuronPageDef.createPageConfig(newNeuron));
                                  });
                                },
                              ));
                            }.takeIf((e) => neuron.maturityE8sEquivalent.toDouble() > 0 && neuron.isCurrentUserController),
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
