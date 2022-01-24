import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../../nns_dapp.dart';
import '../wizard_overlay.dart';
import 'enter_amount_page.dart';

class SelectNeuronTopUpSourceWallet extends StatefulWidget {
  final Neuron neuron;
  const SelectNeuronTopUpSourceWallet({
    Key? key,
    required this.neuron,
  }) : super(key: key);

  @override
  _SelectNeuronTopUpSourceWalletState createState() =>
      _SelectNeuronTopUpSourceWalletState();
}

class _SelectNeuronTopUpSourceWalletState
    extends State<SelectNeuronTopUpSourceWallet> {
  final ValidatedTextField addressField = ValidatedTextField("Address",
      validations: [StringFieldValidation.minimumLength(40)]);

  @override
  Widget build(BuildContext context) {
    final allAccounts = context.boxes.accounts.values
        .toList()
        .sortedBy((element) => element.primary ? 0 : 1)
        .thenBy((element) => element.name);
    return Container(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (allAccounts.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "My Accounts",
                          style: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? context.textTheme.headline3
                              : context.textTheme.headline4,
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
                                  allAccounts.mapToList((e) => _AccountRow(
                                      account: e,
                                      onPressed: () {
                                        final address = e.accountIdentifier;
                                        final source =
                                            context.boxes.accounts[address]!;
                                        WizardOverlay.of(context).pushPage(
                                            "Enter ICP Amount",
                                            EnterAmountPage(
                                              source: source,
                                              destinationAccountIdentifier:
                                                  widget
                                                      .neuron.accountIdentifier,
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
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(account.name,
                    style: Responsive.isDesktop(context) |
                            Responsive.isTablet(context)
                        ? context.textTheme.headline3
                        : context.textTheme.headline4),
                BalanceDisplayWidget(
                  amount: account.balance,
                  amountSize: Responsive.isDesktop(context) |
                          Responsive.isTablet(context)
                      ? 30
                      : 14,
                  icpLabelSize: 25,
                ),
              ],
            ),
            SmallFormDivider(),
            Text(account.accountIdentifier,
                style: context.textTheme.bodyText1,
                textAlign: TextAlign.start,
                maxLines: 2),
          ],
        ),
      ),
    );
  }
}
