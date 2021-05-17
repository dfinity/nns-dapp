import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/neurons/increase_dissolve_delay_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';
import 'package:dartx/dartx.dart';
import 'dart:math';

import 'following/configure_followers_page.dart';

class StakeNeuronPage extends StatefulWidget {
  final ICPSource source;

  const StakeNeuronPage({Key? key, required this.source}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    amountField = ValidatedTextField("Amount",
        validations: [
          StringFieldValidation.insufficientFunds(widget.source.icpBalance, 2),
          StringFieldValidation("Minimum amount: 1 ICP", (e) => (e.toDoubleOrNull() ?? 0) < 1),
        ],
        inputFormatters: <TextInputFormatter>[ FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')) ],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IntrinsicWidth(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TallFormDivider(),
                        SelectableText("Source",
                            style: context.textTheme.headline4),
                        VerySmallFormDivider(),
                        ResponsiveCopyId(accountIdentifier: widget.source.address),
                        SmallFormDivider(),
                        Text("Transaction Fee",
                            style: context.textTheme.headline4),
                        VerySmallFormDivider(),
                        // fee is doubled as it is a SEND and NOTIFY
                        Text((TRANSACTION_FEE_ICP * 2).toString() + " ICP",
                            style: context.textTheme.bodyText1),
                        VerySmallFormDivider()
                      ],
                    ),
                  ),
                  Center(
                      child: Column(
                    children: [
                      Text("Current Balance: "),
                      BalanceDisplayWidget(
                        amount: widget.source.icpBalance,
                        amountSize: 40,
                        icpLabelSize: 0,
                      ),
                    ],
                  )),
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 500),
                        child: DebouncedValidatedFormField(
                          amountField,
                          onChanged: () {
                            setState(() {});
                          },
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 100,
                  )
                ],
              ),
            ),
          ),
          Column(
            children: [
              Container(
                width: double.infinity,
                color: AppColors.lightBackground,
                height: 100,
                padding: EdgeInsets.symmetric(horizontal: 64, vertical: 16),
                child: ElevatedButton(
                  child: Text("Create"),
                  onPressed: () async {
                    // TODO: Should be using the returned neuronId
                    await context.callUpdate(() => context.icApi
                        .createNeuron(
                            stakeInDoms:
                                amountField.currentValue.toDouble().toE8s,
                            fromSubAccount: widget.source.subAccountId));
                    final newNeuron = context.boxes.neurons.values
                        .sortedByDescending((element) =>
                            element.createdTimestampSeconds.toBigInt)
                        .first;

                    WizardOverlay.of(context).replacePage(
                        "Set Dissolve Delay",
                        IncreaseDissolveDelayWidget(
                            neuron: newNeuron,
                            cancelTitle: "Skip",
                            onCompleteAction: (context) {
                              WizardOverlay.of(context).replacePage(
                                  "Follow Neurons",
                                  ConfigureFollowersPage(
                                    neuron: newNeuron,
                                    completeAction: (context) {
                                      OverlayBaseWidget.of(context)?.dismiss();
                                      context.nav.push(
                                          NeuronPageDef.createPageConfig(
                                              newNeuron));
                                    },
                                  ));
                            }));
                  }.takeIf((e) => <ValidatedField>[amountField].allAreValid),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
