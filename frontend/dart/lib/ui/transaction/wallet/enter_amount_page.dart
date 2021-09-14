import 'package:flutter/services.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/max_button.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';
import 'confirm_transactions_widget.dart';

class EnterAmountPage extends StatefulWidget {
  final ICPSource source;
  final String destinationAccountIdentifier;

  const EnterAmountPage({
    Key? key,
    required this.source,
    required this.destinationAccountIdentifier,
  }) : super(key: key);

  @override
  _EnterAmountPageState createState() => _EnterAmountPageState();
}

class _EnterAmountPageState extends State<EnterAmountPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();

    amountField = ValidatedTextField("Amount",
        validations: [
          StringFieldValidation.insufficientFunds(widget.source.balance, 1),
          StringFieldValidation.greaterThanZero()
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
                      amount: widget.source.balance,
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
                  widthFactor: 1,
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
                                  source: widget.source),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              TallFormDivider(),
              IntrinsicWidth(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Source",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline3
                            : context.textTheme.headline4),
                    VerySmallFormDivider(),
                    SelectableText(widget.source.address,
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.bodyText1
                            : context.textTheme.bodyText2),
                    TallFormDivider(),
                    Text("Destination",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline3
                            : context.textTheme.headline4),
                    VerySmallFormDivider(),
                    SelectableText(widget.destinationAccountIdentifier,
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.bodyText1
                            : context.textTheme.bodyText2),
                    TallFormDivider(),
                    Text("Transaction Fee (billed to source)",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline3
                            : context.textTheme.headline4),
                    VerySmallFormDivider(),
                    Text(
                        ICP
                                .fromE8s(BigInt.from(TRANSACTION_FEE_E8S))
                                .asString() +
                            " ICP",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.bodyText1
                            : context.textTheme.bodyText2),
                  ],
                ),
              ),
              // Expanded(child: Container()),
              VerySmallFormDivider(),
              SizedBox(
                  height: 70,
                  width: double.infinity,
                  child: ValidFieldsSubmitButton(
                    child: Text(
                      "Review Transaction",
                      style: TextStyle(
                          fontSize: Responsive.isTablet(context) |
                                  Responsive.isDesktop(context)
                              ? kTextSizeLarge
                              : kTextSizeSmall),
                    ),
                    onPressed: () async {
                      var amount = ICP.fromString(amountField.currentValue);
                      WizardOverlay.of(context).pushPage(
                          "Review Transaction",
                          ConfirmTransactionWidget(
                            fee: ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)),
                            amount: amount,
                            source: widget.source,
                            destination: widget.destinationAccountIdentifier,
                          ));
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
