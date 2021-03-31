import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import '../../dfinity.dart';

class NeuronDetailWidget extends StatefulWidget {
  final Neuron neuron;

  const NeuronDetailWidget(this.neuron, {Key? key}) : super(key: key);

  @override
  _NeuronDetailWidgetState createState() => _NeuronDetailWidgetState();
}

class _NeuronDetailWidgetState extends State<NeuronDetailWidget> {
  OverlayEntry? _overlayEntry;

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
                    Card(
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
                                  child: Text(widget.neuron.identifier,
                                      style: context.textTheme.headline3),
                                ),
                                Column(
                                  children: [
                                    BalanceDisplayWidget(
                                        amount: widget.neuron.domsBalance.toICPT,
                                        amountSize: 30,
                                        icpLabelSize: 15),
                                    Text("Staked")
                                  ],
                                )
                              ],
                            ),
                            Text("Details", style: context.textTheme.headline3),
                            SizedBox(
                              height: 10,
                            ),
                            Text("Status: ${widget.neuron.state.description}"),
                            Text(
                                "Time Remaining ${widget.neuron.durationRemaining}"),
                            SizedBox(
                              height: 10,
                            ),
                            buildStateButton()
                          ],
                        ),
                      ),
                    ),
                    SmallFormDivider(),
                    Card(
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
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 8.0),
                                        child: Text(
                                            "You can use your rewarded ICP to create a new neuron, convert it into cycles, or send it to your wallet."),
                                      )
                                    ],
                                  ),
                                ),
                                Column(
                                  children: [
                                    BalanceDisplayWidget(
                                        amount: 0,
                                        amountSize: 30,
                                        icpLabelSize: 15),
                                    Text("Available")
                                  ],
                                )
                              ],
                            ),
                            ElevatedButton(
                                style: ButtonStyle(
                                    backgroundColor: MaterialStateProperty.all(
                                        AppColors.blue600),
                                    shape: MaterialStateProperty.all(
                                        RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(10)))),
                                onPressed: () {
                                  _overlayEntry =
                                      _createOverlayEntry(NewTransactionOverlay(
                                    rootTitle: "Spawn Neuron",
                                    rootWidget:
                                        StakeNeuronPage(source: widget.neuron),
                                  ));
                                  Overlay.of(context)?.insert(_overlayEntry!);
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Text("Spawn Neuron"),
                                ))
                          ],
                        ),
                      ),
                    ),
                    SmallFormDivider(),
                    Card(
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
                                  child: Text("Voting",
                                      style: context.textTheme.headline3),
                                ),

                              ],
                            ),
                            SizedBox(height: 150,)
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
        ));
  }

  ElevatedButton buildStateButton() {
    switch (widget.neuron.state) {
      case NeuronState.DISPERSING:
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
              context.performLoading(
                  () => context.icApi.stopDissolving(widget.neuron.id));
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
              context.performLoading(
                      () => context.icApi.startDissolving(widget.neuron.id));
            });
      case NeuronState.UNLOCKED:
        return ElevatedButton(child: Text("Send ICP"), onPressed: () {});
    }
  }

  OverlayEntry _createOverlayEntry(Widget overlayWidget) {
    final parentContext = this.context;
    return OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
        parentContext: parentContext,
        overlayEntry: _overlayEntry,
        child: overlayWidget,
      );
    });
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
