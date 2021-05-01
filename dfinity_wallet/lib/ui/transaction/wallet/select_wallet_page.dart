import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/canister/topup_canister_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/enter_amount_page.dart';
import '../../../dfinity.dart';
import '../create_transaction_overlay.dart';
import 'new_wallet_page.dart';

class SelectDestinationAccountPage extends StatefulWidget {
  final ICPSource source;

  const SelectDestinationAccountPage({Key? key, required this.source})
      : super(key: key);

  @override
  _SelectDestinationAccountPageState createState() =>
      _SelectDestinationAccountPageState();
}

class _SelectDestinationAccountPageState
    extends State<SelectDestinationAccountPage> {
  final ValidatedTextField addressField = ValidatedTextField("Address",
      validations: [StringFieldValidation.minimumLength(40)]);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Enter Address", style: context.textTheme.headline3),
                  DebouncedValidatedFormField(addressField),
                  Center(
                    child: FractionallySizedBox(
                      widthFactor: 0.5,
                      alignment: Alignment.center,
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ValidFieldsSubmitButton(
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Text(
                              "Send",
                              style: context.textTheme.subtitle1,
                            ),
                          ),
                          fields: [addressField],
                          onPressed: () {
                            final address = addressField.currentValue;
                            WizardOverlay.of(context).pushPage(
                                "Enter ICP Amount",
                                EnterAmountPage(
                                  origin: widget.source,
                                  destinationAccountIdentifier: address
                                ));
                          },
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
          if(context.boxes.accounts.values.length > 1)
            Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "My Accounts",
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
                          children: context.boxes.accounts.values
                              .filter((element) => element != widget.source)
                              .mapToList((e) => _AccountRow(
                                  account: e,
                                  onPressed: () {
                                    WizardOverlay.of(context).pushPage(
                                        "Enter ICP Amount",
                                        EnterAmountPage(
                                          origin: widget.source,
                                          destinationAccountIdentifier: e.accountIdentifier,
                                        ));
                                  })),
                        ),
                      ),
                    )
                  ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _AccountRow extends StatelessWidget {
  final Account account;
  final VoidCallback onPressed;
  final bool selected;

  const _AccountRow(
      {Key? key,
      required this.account,
      required this.onPressed,
      this.selected = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FlatButton(
      onPressed: onPressed,
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    account.name,
                    style: context.textTheme.headline3,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: Text(
                    account.accountIdentifier,
                    style: context.textTheme.bodyText2,
                  ),
                )
              ],
            ),
          ),
          BalanceDisplayWidget(
              amount: account.balance.toBigInt.toICPT,
              amountSize: 30, icpLabelSize: 20)
        ],
      ),
    );
  }
}
