import 'dart:async';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/wallet/balance_display_widget.dart';

import 'neuron_row.dart';

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
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    "You can stake ICP by storing them in Neurons. These neurons allow you to participate in the IC Governance by giving you the ability to vote on proposals",
                    style: context.textTheme.bodyText2,
                    textAlign: TextAlign.left,
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
            rootWidget: StakeNeuronPage(source: parentContext.boxes.accounts.primary),
          ));
    });
  }
}

