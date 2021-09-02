import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/max_button.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/neurons/detail/hardware_neuron.dart';
import 'package:dfinity_wallet/ui/neurons/increase_dissolve_delay_widget.dart';
import 'package:universal_html/js.dart' as js;
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:flutter/services.dart';
import '../../dfinity.dart';
import 'package:dartx/dartx.dart';
import 'following/configure_followers_page.dart';

class StakeNeuronPage extends StatefulWidget {
  final Account source;

  const StakeNeuronPage({Key? key, required this.source}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();
    amountField = ValidatedTextField("Amount",
        validations: [
          StringFieldValidation.insufficientFunds(widget.source.balance, 1),
          StringFieldValidation(
              "Minimum amount: 1 ICP", (e) => (e.toDoubleOrNull() ?? 0) < 1),
        ],
        inputFormatters: <TextInputFormatter>[ICPTextInputFormatter()],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    return Container(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IntrinsicWidth(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TallFormDivider(),
                          SelectableText("Source",
                              style: Responsive.isDesktop(context) |
                                      Responsive.isTablet(context)
                                  ? context.textTheme.headline3
                                  : context.textTheme.headline4),
                          VerySmallFormDivider(),
                          Text(widget.source.address,
                              style: Responsive.isDesktop(context) |
                                      Responsive.isTablet(context)
                                  ? context.textTheme.bodyText1
                                  : context.textTheme.bodyText2),
                          TallFormDivider(),
                          Text("Transaction Fee",
                              style: Responsive.isDesktop(context) |
                                      Responsive.isTablet(context)
                                  ? context.textTheme.headline3
                                  : context.textTheme.headline4),
                          VerySmallFormDivider(),
                          // fee is doubled as it is a SEND and NOTIFY
                          Text(
                              (ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)))
                                      .asString(myLocale.languageCode) +
                                  " ICP",
                              style: Responsive.isDesktop(context) |
                                      Responsive.isTablet(context)
                                  ? context.textTheme.bodyText1
                                  : context.textTheme.bodyText2),
                          VerySmallFormDivider()
                        ],
                      ),
                    ),
                    SmallFormDivider(),
                    Center(
                        child: Column(
                      children: [
                        Text(
                          "Current Balance: ",
                          style: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? TextStyle(fontSize: kTextSizeLarge)
                              : TextStyle(fontSize: kTextSizeSmall),
                        ),
                        VerySmallFormDivider(),
                        BalanceDisplayWidget(
                          amount: widget.source.balance,
                          amountSize: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? kCurrentBalanceSizeBig
                              : kCurrentBalanceSizeSmall,
                          icpLabelSize: 0,
                          locale: myLocale.languageCode,
                        ),
                      ],
                    )),
                    Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 500),
                        child: Stack(
                          children: [
                            DebouncedValidatedFormField(
                              amountField,
                            ),
                            MaxButton(
                                amountField: amountField,
                                source: widget.source),
                          ],
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
          ),
          Column(
            children: [
              Text('(This may take up to 1 minute)',
                  style: Responsive.isDesktop(context) |
                          Responsive.isTablet(context)
                      ? context.textTheme.bodyText1
                      : context.textTheme.bodyText2),
              Container(
                width: double.infinity,
                height: 100,
                padding: EdgeInsets.symmetric(horizontal: 64, vertical: 20),
                child: ValidFieldsSubmitButton(
                  child: Text("Create",
                      style: TextStyle(
                          fontSize: Responsive.isTablet(context) |
                                  Responsive.isDesktop(context)
                              ? kTextSizeLarge
                              : kTextSizeSmall)),
                  onPressed: () async {
                    final stakeAmount =
                        ICP.fromString(amountField.currentValue);

                    final res = await context.callUpdate(() =>
                        context.icApi.stakeNeuron(widget.source, stakeAmount));

                    res.when(err: (err) {
                      // Staking failed. Display the error.
                      js.context.callMethod("alert", ["$err"]);
                    }, ok: (newNeuronId) async {
                      if (widget.source.type == ICPSourceType.HARDWARE_WALLET) {
                        WizardOverlay.of(context).replacePage(
                            "Neuron Created Successfully",
                            HardwareWalletNeuron(
                                amount: stakeAmount,
                                neuronId: newNeuronId,
                                onSkip: (context) async {
                                  // User skipped adding the hotkey. Nothing to do.
                                  OverlayBaseWidget.of(context)?.dismiss();
                                },
                                onAddHotkey: (context) async {
                                  // User added the hotkey. Fetch the neuron.
                                  final newNeuron = await context.icApi
                                      .fetchNeuron(
                                          neuronId: newNeuronId.asBigInt());

                                  // Prompt to set a dissolve delay.
                                  WizardOverlay.of(context).replacePage(
                                      "Set Dissolve Delay",
                                      IncreaseDissolveDelayWidget(
                                          neuron: newNeuron!,
                                          cancelTitle: "Skip",
                                          onCompleteAction: (context) {
                                            WizardOverlay.of(context)
                                                .replacePage(
                                                    "Follow Neurons",
                                                    ConfigureFollowersPage(
                                                      neuron: newNeuron,
                                                      completeAction:
                                                          (context) {
                                                        OverlayBaseWidget.of(
                                                                context)
                                                            ?.dismiss();
                                                        context.nav.push(
                                                            neuronPageDef
                                                                .createPageConfig(
                                                                    newNeuron));
                                                      },
                                                    ));
                                          }));
                                }));
                      } else {
                        final newNeuron = await context.icApi
                            .fetchNeuron(neuronId: newNeuronId.asBigInt());
                        WizardOverlay.of(context).replacePage(
                            "Set Dissolve Delay",
                            IncreaseDissolveDelayWidget(
                                neuron: newNeuron!,
                                cancelTitle: "Skip",
                                onCompleteAction: (context) {
                                  WizardOverlay.of(context).replacePage(
                                      "Follow Neurons",
                                      ConfigureFollowersPage(
                                        neuron: newNeuron,
                                        completeAction: (context) {
                                          OverlayBaseWidget.of(context)
                                              ?.dismiss();
                                          context.nav.push(neuronPageDef
                                              .createPageConfig(newNeuron));
                                        },
                                      ));
                                }));
                      }
                    });
                  },
                  fields: [amountField],
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
