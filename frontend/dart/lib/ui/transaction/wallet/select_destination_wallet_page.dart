import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';
import 'confirm_transactions_widget.dart';
import 'enter_amount_page.dart';

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
    final otherAccounts = context.boxes.accounts.values
        .filter((element) => element != widget.source)
        .toList();
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
                    Text(
                      "Enter Address",
                      style: Responsive.isMobile(context)
                          ? context.textTheme.headline4
                          : context.textTheme.headline3,
                    ),
                    DebouncedValidatedFormField(addressField),
                    Center(
                      child: FractionallySizedBox(
                        widthFactor: 1,
                        alignment: Alignment.center,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: ValidFieldsSubmitButton(
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                "Continue",
                                style: Responsive.isDesktop(context) |
                                        Responsive.isTablet(context)
                                    ? context.textTheme.subtitle1
                                    : context.textTheme.subtitle2,
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
                                      fee: ICP.zero,
                                      amount: widget.source.balance,
                                      source: widget.source,
                                      destination: address,
                                    ));
                              } else {
                                WizardOverlay.of(context).pushPage(
                                    "Enter ICP Amount",
                                    EnterAmountPage(
                                      source: widget.source,
                                      destinationAccountIdentifier: address,
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
                                                fee: ICP.zero,
                                                amount: widget.source.balance,
                                                source: widget.source,
                                                destination:
                                                    e.accountIdentifier,
                                              ));
                                        } else {
                                          WizardOverlay.of(context).pushPage(
                                              "Enter ICP Amount",
                                              EnterAmountPage(
                                                source: widget.source,
                                                destinationAccountIdentifier:
                                                    e.accountIdentifier,
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
    return TextButton(
      onPressed: onPressed,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                account.name,
                style:
                    Responsive.isDesktop(context) | Responsive.isTablet(context)
                        ? context.textTheme.headline3
                        : context.textTheme.headline4,
              ),
              BalanceDisplayWidget(
                amount: account.balance,
                amountSize:
                    Responsive.isDesktop(context) | Responsive.isTablet(context)
                        ? 30
                        : 14,
                icpLabelSize: 20,
              ),
            ],
          ),
          SmallFormDivider(),
          AutoSizeText(
            account.accountIdentifier,
            style: context.textTheme.bodyText1,
            selectable: false,
          ),
        ],
      ),
    );
  }
}
