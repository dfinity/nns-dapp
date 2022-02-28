import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/tab/neuron_row.dart';
import 'package:nns_dapp/ui/transaction/wallet/merge_neuron_destination_page.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';

class MergeNeuronSourceAccount extends StatefulWidget {
  MergeNeuronSourceAccount();

  @override
  _MergeNeuronSourceAccountState createState() =>
      _MergeNeuronSourceAccountState();
}

class _MergeNeuronSourceAccountState extends State<MergeNeuronSourceAccount> {
  @override
  Widget build(BuildContext context) {
    final allAccounts = (context.boxes.neurons.values?.sortedByDescending(
        (element) => element.createdTimestampSeconds.toBigInt));
    return Container(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (allAccounts!.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "My Neurons",
                          style: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? context.textTheme.headline3
                              : context.textTheme.headline4,
                        ),
                        SmallFormDivider(),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Container(
                            decoration: ShapeDecoration(
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    side: BorderSide(
                                        width: 2, color: AppColors.gray800))),
                            child: Column(
                              children: allAccounts.mapToList((e) => TextButton(
                                    onPressed: () {
                                      final address = e.identifier;
                                      print("Neuron address is : $address");
                                      final source =
                                          context.boxes.neurons[address]!;
                                      print('Neuron source is : $source');
                                      WizardOverlay.of(context).pushPage(
                                          "Select Destination",
                                          SelectDestinationNeuronAccountPage(
                                              source: source));
                                    },
                                    child: NeuronRow(
                                      neuron: e,
                                      showsWarning: true,
                                    ),
                                  )),
                            ),
                          ),
                        )
                      ]),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
