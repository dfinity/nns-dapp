import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/page_button.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_source_wallet_page.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

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
            stream: context.boxes.neurons.changes,
            builder: (context, snapshot) {
              return TabTitleAndContent(
                title: "Neurons",
                subtitle:
                    '''Earn rewards by staking your ICP in neurons. Neurons allow you to participate in governance on the Internet Computer by voting on Network Nervous System (NNS) proposals.
                    
Your principal id is "${context.icApi.getPrincipal()}"''',
                children: [
                  SmallFormDivider(),
                  ...(context.boxes.neurons.values
                          ?.sortedByDescending((element) =>
                              element.createdTimestampSeconds.toBigInt)
                          ?.mapToList((e) => Card(
                                child: TextButton(
                                  onPressed: () {
                                    context.nav.push(
                                        neuronPageDef.createPageConfig(e));
                                  },
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: NeuronRow(
                                      neuron: e,
                                      showsWarning: true,
                                      onTap: () {
                                        context.nav.push(
                                            neuronPageDef.createPageConfig(e));
                                      },
                                    ),
                                  ),
                                ),
                              )) ??
                      []),
                  SizedBox(height: 150)
                ],
              );
            }),
      ),
      footer: Align(
        alignment: Alignment.bottomCenter,
        child: PageButton(
          title: "Stake Neuron",
          onPress: () {
            OverlayBaseWidget.show(
              context,
              WizardOverlay(
                rootTitle: "Select Source Account",
                rootWidget: SelectSourceWallet(isStakeNeuron: true),
              ),
            );
          },
        ),
      ),
    );
  }
}
