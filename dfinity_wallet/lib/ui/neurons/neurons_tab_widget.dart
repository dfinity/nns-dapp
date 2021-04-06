import 'dart:async';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/neurons/neuron_detail_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';

class NeuronsPage extends StatefulWidget {
  @override
  _NeuronsPageState createState() => _NeuronsPageState();
}

class _NeuronsPageState extends State<NeuronsPage> {

  OverlayEntry? _overlayEntry;

  @override
  Widget build(BuildContext context) {
    return FooterGradientButton(
      footerHeight: null,
      body: ConstrainWidthAndCenter(
        child: StreamBuilder<void>(
          stream: context.boxes.neurons.watch(),
          builder: (context, snapshot) {
            return TabTitleAndContent(
              title: "Neurons",
              children: [
                Card(
                  color: AppColors.black,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      "Neurons are long term stores of ICP.\n\n Storing ICP in neurons earns rewards.\n\n ICP stored in neurons give you power to vote on proposals.",
                      style: context.textTheme.bodyText1,
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                SmallFormDivider(),
                ...context.boxes.neurons.values.mapToList((e) => NeuronRow(
                      neuron: e,
                      showsWarning: true,
                      onPressed: () {
                        context.nav.push(NeuronPageDef.createPageConfig(e));
                      },
                    )),
                SizedBox(height: 150)
              ],
            );
          }
        ),
      ),
      footer: Align(
        alignment: Alignment.bottomCenter,
        child: IntrinsicHeight(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: ElevatedButton(
               child: Padding(
                 padding: const EdgeInsets.all(16.0),
                 child: SizedBox(
                   width: 400,
                   child: Center(
                     child: Text(
                       "Stake Neuron",
                       textAlign: TextAlign.center,
                       style: context.textTheme.button?.copyWith(fontSize: 24),
                     ),
                   ),
                 ),
               ),
               onPressed: () {
                 _overlayEntry = _createOverlayEntry();
                 Overlay.of(context)?.insert(_overlayEntry!);
               },
            ),
          ),
        ),
      ),
    );
  }

  OverlayEntry _createOverlayEntry() {
    final parentContext = this.context;
    return OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
          parentContext: parentContext,
          overlayEntry: _overlayEntry,
          child: NewTransactionOverlay(
            rootTitle: "Stake Neuron",
            rootWidget: StakeNeuronPage(source: parentContext.boxes.wallets.primary),
          ));
    });
  }
}

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  neuron.address,
                  style: context.textTheme.headline4,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  "${neuron.votingPower.toBigInt.toICPT} Voting Power",
                  style: context.textTheme.bodyText1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
