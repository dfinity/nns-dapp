import 'package:dfinity_wallet/ui/_components/form_utils.dart';
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectableText(neuron.identifier,
                          style: context.textTheme.headline2),
                      VerySmallFormDivider(),
                      Row(children: [
                        Text("${neuron.state.description}",
                            style: context.textTheme.headline4?.copyWith(
                              color: neuron.state.statusColor,
                            )),
                        SizedBox(width: 5,),
                        SizedBox(
                          width: 30,
                          height: 30,
                          child: SvgPicture.asset(
                            neuron.state.iconName,
                            color: neuron.state.statusColor,
                          ),
                        ),

                      ]),
                      VerySmallFormDivider(),
                      if (neuron.state == NeuronState.DISSOLVING)
                        Row(
                          children: [
                            Text(
                                "${neuron.durationRemaining.yearsDayHourMinuteSecondFormatted()}", style: context.textTheme.bodyText1,),
                            Text(" Remaining", style: context.textTheme.bodyText2)
                          ],
                        ),
                      if (neuron.state == NeuronState.LOCKED)
                        Row(
                          children: [
                            Text(
                                "${neuron.dissolveDelay.yearsDayHourMinuteSecondFormatted()}", style: context.textTheme.bodyText1),
                            Text(" Dissolve Delay", style: context.textTheme.bodyText2)
                          ],
                        ),
                      VerySmallFormDivider(),
                      Row(
                        children: [
                          Text(
                              "${neuron.createdTimestampSeconds.secondsToDateTime().dayFormat}", style: context.textTheme.bodyText1),
                          Text(" Spawned", style: context.textTheme.bodyText2)
                        ],
                      ),
                    ],
                  ),
                ),
                LabelledBalanceDisplayWidget(
                    amount: neuron.stake.toICPT,
                    amountSize: 30,
                    icpLabelSize: 15,
                    text: Text("Stake"))
              ],
            ),
            VerySmallFormDivider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                  ],
                ),
                Align(
                    alignment: Alignment.bottomCenter,
                    child: buildStateButton(context))
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
              child: Text("Disperse"),
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
