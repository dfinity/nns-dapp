
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'confirm_cycles_purchase.dart';

class EnterCyclesPage extends StatefulWidget {
  final Account origin;
  final Canister destinationCanister;

  const EnterCyclesPage(
      {Key? key,
        required this.origin,
        required this.destinationCanister
      })
      : super(key: key);

  @override
  _EnterCyclesPageState createState() => _EnterCyclesPageState();
}

class _EnterCyclesPageState extends State<EnterCyclesPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();

    amountField = ValidatedTextField("Amount",
        validations: [
          FieldValidation("Not enough ICP in account",
                  (e) {
                final amount = (e.toDoubleOrNull() ?? 0);
                return amount == 0 || amount > widget.origin.icpBalance;
              })
        ],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Center(
              child: FractionallySizedBox(
                widthFactor: 0.7,
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
                  Text("Origin Wallet", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(widget.origin.address,
                      style: context.textTheme.bodyText1),
                  TallFormDivider(),
                  Text("Canister", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(widget.destinationCanister.identifier,
                      style: context.textTheme.bodyText1),
                  TallFormDivider(),
                ],
              ),
            ),
            Expanded(child: Container()),
            SizedBox(
                height: 70,
                width: double.infinity,
                child: ValidFieldsSubmitButton(
                  child: Text("Review Cycles Purchase"),
                  onPressed: () async {
                    NewTransactionOverlay.of(context).pushPage(
                        "Review Cycles Purchase",
                        ConfirmCyclesPurchase(
                          amount: amountField.currentValue.toDouble(),
                          origin: widget.origin.address,
                          destination: widget.destinationCanister,
                        ));
                  },
                  fields: [amountField],
                ))
          ],
        ),
      ),
    );
  }
}
