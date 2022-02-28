import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';
import 'package:nns_dapp/ui/neurons/tab/neuron_row.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';
import 'confirm_transactions_widget.dart';
import 'enter_amount_page.dart';

class SelectDestinationNeuronAccountPage extends StatefulWidget {
  final Neuron source;

  const SelectDestinationNeuronAccountPage({Key? key, required this.source})
      : super(key: key);

  @override
  _SelectNeuronDestinationAccountPageState createState() =>
      _SelectNeuronDestinationAccountPageState();
}

class _SelectNeuronDestinationAccountPageState
    extends State<SelectDestinationNeuronAccountPage> {
  @override
  Widget build(BuildContext context) {
    final otherAccounts = context.boxes.neurons.values
        .filter((element) => element != widget.source)
        .toList();
    return Container(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (otherAccounts.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "My Neuron Accounts",
                          style: context.textTheme.headline3,
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
                              children: otherAccounts.mapToList(
                                (e) => NeuronRow(
                                  neuron: e,
                                  showsWarning: true,
                                ),
                              ),
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
