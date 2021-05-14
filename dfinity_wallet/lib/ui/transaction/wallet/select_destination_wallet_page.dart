import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/confirm_transactions_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/enter_amount_page.dart';
import '../../../dfinity.dart';
import '../wizard_overlay.dart';

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
    final otherAccounts = context.boxes.accounts.values.filter((element) => element != widget.source).toList();
    return Container(
      child: SingleChildScrollView(
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
                                "Continue",
                                style: context.textTheme.subtitle1,
                              ),
                            ),
                            fields: [addressField],
                            onPressed: () {
                              final address = addressField.currentValue;

                              if (widget.source.type == ICPSourceType.NEURON) {
                                // neurons skip entering amount and go right to review
                                WizardOverlay.of(context).pushPage(
                                    "Review Transaction",
                                    ConfirmTransactionWidget(
                                      // if we're disbursing, no fee?
                                      fee: 0,
                                      amount: widget.source.icpBalance,
                                      source: widget.source,
                                      destination: address,
                                      subAccountId: widget.source.subAccountId,
                                    ));
                              } else {
                                WizardOverlay.of(context).pushPage(
                                    "Enter ICP Amount",
                                    EnterAmountPage(
                                      source: widget.source,
                                      destinationAccountIdentifier: address,
                                      subAccountId: widget.source.subAccountId,
                                    ));
                              }
                            },
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
            if (otherAccounts.isNotEmpty)
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
                              children:
                              otherAccounts.mapToList((e) => _AccountRow(
                                      account: e,
                                      onPressed: () {
                                        if (widget.source.type ==
                                            ICPSourceType.NEURON) {
                                          WizardOverlay.of(context).pushPage(
                                              "Review Transaction",
                                              ConfirmTransactionWidget(
                                                fee: 0,
                                                amount:
                                                    widget.source.icpBalance,
                                                source: widget.source,
                                                destination:
                                                    e.accountIdentifier,
                                                subAccountId:
                                                    widget.source.subAccountId,
                                              ));
                                        } else {
                                          WizardOverlay.of(context).pushPage(
                                              "Enter ICP Amount",
                                              EnterAmountPage(
                                                source: widget.source,
                                                destinationAccountIdentifier:
                                                    e.accountIdentifier,
                                                subAccountId:
                                                    widget.source.subAccountId,
                                              ));
                                        }
                                      })),
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
              amountSize: 30,
              icpLabelSize: 20)
        ],
      ),
    );
  }
}
