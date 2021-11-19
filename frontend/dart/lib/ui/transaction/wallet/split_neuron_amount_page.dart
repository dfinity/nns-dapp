import 'package:flutter/services.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/max_button.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';
import '../../../nns_dapp.dart';

class SplitNeuronStakePage extends StatefulWidget {
  final Neuron neuron;

  const SplitNeuronStakePage({
    Key? key,
    required this.neuron,
  }) : super(key: key);

  @override
  _SplitNeuronStakePageState createState() => _SplitNeuronStakePageState();
}

class _SplitNeuronStakePageState extends State<SplitNeuronStakePage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();

    amountField = ValidatedTextField("Amount",
        validations: [
          // The numberOfTransactions arg is 0 because the fee is taken out of
          // the new neuron's stake rather than the sending neuron's.
          StringFieldValidation.insufficientFunds(widget.neuron.balance - ICP.one, 0),
          StringFieldValidation("Minimum amount: 1.0001 ICP",
              (e) => (e.toDoubleOrNull() ?? 0) < 1.0001),
        ],
        inputType: TextInputType.number,
        inputFormatters: <TextInputFormatter>[ICPTextInputFormatter()]);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Center(
                child: Column(
                  children: [
                    Text("Current Balance: ",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? TextStyle(fontSize: kTextSizeLarge)
                            : TextStyle(fontSize: kTextSizeSmall)),
                    SmallFormDivider(),
                    BalanceDisplayWidget(
                      amount: widget.neuron.balance,
                      amountSize: Responsive.isDesktop(context) |
                              Responsive.isTablet(context)
                          ? kCurrentBalanceSizeBig
                          : kCurrentBalanceSizeSmall,
                      icpLabelSize: 0,
                    )
                  ],
                ),
              ),
              Center(
                child: FractionallySizedBox(
                  widthFactor: Responsive.isMobile(context) ? 1.2 : 1,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(6.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text("Amount", style: context.textTheme.headline3),
                          Stack(
                            children: [
                              DebouncedValidatedFormField(amountField),
                              MaxButton(
                                  amountField: amountField,
                                  source: widget.neuron),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Expanded(child: Container()),
              SizedBox(height: 150),
              Align(
                alignment: Alignment.topLeft,
                child: Text("Transaction Fee",
                    style: Responsive.isDesktop(context) |
                            Responsive.isTablet(context)
                        ? context.textTheme.headline3
                        : context.textTheme.headline4),
              ),
              VerySmallFormDivider(),
              Align(
                alignment: Alignment.topLeft,
                child: Text(
                    ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)).asString() +
                        " ICP",
                    style: Responsive.isDesktop(context) |
                            Responsive.isTablet(context)
                        ? context.textTheme.bodyText1
                        : context.textTheme.bodyText2),
              ),
              SizedBox(height: 40),
              SizedBox(
                  height: 70,
                  width: double.infinity,
                  child: ValidFieldsSubmitButton(
                    child: Text(
                      "Confirm Split",
                      style: TextStyle(
                          fontSize: Responsive.isTablet(context) |
                                  Responsive.isDesktop(context)
                              ? kTextSizeLarge
                              : kTextSizeSmall),
                    ),
                    onPressed: () async {
                      await context.callUpdate(() => context.icApi.splitNeuron(
                          neuron: widget.neuron,
                          amount: ICP.fromString(amountField.currentValue)));
                      OverlayBaseWidget.of(context)?.dismiss();
                    },
                    fields: [amountField],
                  ))
            ],
          ),
        ),
      ),
    );
  }
}
