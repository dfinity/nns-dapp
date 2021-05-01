import 'dart:async';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../stake_neuron_page.dart';
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
                subtitle:
                    "Earn rewards by staking your ICP in neurons. Neurons allow you to participate in governance on the Internet Computer by voting on Network Nervous System (NNS) proposals.",
                children: [
                  SmallFormDivider(),
                  ...(context.boxes.accounts.primary.neurons?.mapToList((e) => Card(
                        child: FlatButton(
                          onPressed: () {
                            context.nav.push(NeuronPageDef.createPageConfig(e));
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: NeuronRow(
                              neuron: e,
                              showsWarning: true,
                              onTap: (){
                                context.nav.push(NeuronPageDef.createPageConfig(e));
                              },
                            ),
                          ),
                        ),
                      )) ?? []),
                  SizedBox(height: 150)
                ],
              );
            }),
      ),
      footer: Align(
        alignment: Alignment.bottomCenter,
        child: Padding(
          padding: EdgeInsets.all(32),
          child: ElevatedButton(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: 400,
                child: Text(
                  "Stake Neuron",
                  textAlign: TextAlign.center,
                  style: context.textTheme.button?.copyWith(fontSize: 24),
                ),
              ),
            ),
            onPressed: () {
              OverlayBaseWidget.show(
                  context,
                  WizardOverlay(
                    rootTitle: "Stake Neuron",
                    rootWidget: StakeNeuronPage(
                        source: context.boxes.accounts.primary),
                  ));
            },
          ),
        ),
      ),
    );
  }
}
