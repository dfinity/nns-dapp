import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:flutter/services.dart';

import '../wizard_overlay.dart';
import 'confirm_transactions_widget.dart';

class EnterAmountPage extends StatefulWidget {
  final ICPSource source;
  final String destinationAccountIdentifier;
  final int? subAccountId;

  const EnterAmountPage(
      {Key? key,
      required this.source,
      required this.destinationAccountIdentifier,
      this.subAccountId})
      : super(key: key);

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
    final myLocale = Localizations.localeOf(context);
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
                    Text("Current Balance: "),
                    BalanceDisplayWidget(
                      amount: widget.source.balance,
                      amountSize: 40,
                      icpLabelSize: 0,
                      locale: myLocale.languageCode,
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
                          DebouncedValidatedFormField(amountField),
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
                    Text("Source", style: context.textTheme.headline4),
                    VerySmallFormDivider(),
                    SelectableText(widget.source.address,
                        style: context.textTheme.bodyText1),
                    TallFormDivider(),
                    Text("Destination", style: context.textTheme.headline4),
                    VerySmallFormDivider(),
                    SelectableText(widget.destinationAccountIdentifier,
                        style: context.textTheme.bodyText1),
                    TallFormDivider(),
                    Text("Transaction Fee (billed to source)",
                        style: context.textTheme.headline4),
                    VerySmallFormDivider(),
                    Text(
                        ICP
                                .fromE8s(BigInt.from(TRANSACTION_FEE_E8S))
                                .asString(myLocale.languageCode) +
                            " ICP",
                        style: context.textTheme.bodyText1),
                  ],
                ),
              ),
              // Expanded(child: Container()),
              VerySmallFormDivider(),
              SizedBox(
                  height: 70,
                  width: double.infinity,
                  child: ValidFieldsSubmitButton(
                    child: Text("Review Transaction"),
                    onPressed: () async {
                      var amount = ICP.fromString(amountField.currentValue);
                      WizardOverlay.of(context).pushPage(
                          "Review Transaction",
                          ConfirmTransactionWidget(
                            fee: ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)),
                            amount: amount,
                            source: widget.source,
                            destination: widget.destinationAccountIdentifier,
                            subAccountId: widget.subAccountId,
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
