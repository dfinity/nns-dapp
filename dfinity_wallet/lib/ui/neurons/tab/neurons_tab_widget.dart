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
              subtitle: "You can stake ICP by storing them in Neurons. These neurons allow you to participate in the IC Governance by giving you the ability to vote on proposals",
              children: [
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
                 Overlay.of(context)?.show(context, NewTransactionOverlay(
                   rootTitle: "Stake Neuron",
                   rootWidget: StakeNeuronPage(source: context.boxes.accounts.primary),
                 ));
               },
            ),
          ),
        ),
      ),
    );
  }
}

