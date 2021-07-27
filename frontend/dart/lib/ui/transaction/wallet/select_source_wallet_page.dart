import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neurons/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_destination_wallet_page.dart';
import 'package:flutter/services.dart';
import '../../../dfinity.dart';
import '../wizard_overlay.dart';

class SelectSourceWallet extends StatefulWidget {
  final neuronStakePressed;

  SelectSourceWallet({required this.neuronStakePressed});

  @override
  _SelectSourceWalletState createState() => _SelectSourceWalletState();
}

class _SelectSourceWalletState extends State<SelectSourceWallet> {
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
                                        widget.neuronStakePressed
                                            ? WizardOverlay.of(context)
                                                .pushPage(
                                                "Stake Neuron",
                                                StakeNeuronPage(source: source),
                                              )
                                            : WizardOverlay.of(context).pushPage(
                                                "Select Destination",
                                                SelectDestinationAccountPage(
                                                    source: source));
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
    final myLocale = Localizations.localeOf(context);
    return FlatButton(
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
                  locale: myLocale.languageCode,
                ),
              ],
            ),
            SmallFormDivider(),
            Text(account.accountIdentifier,
                style: context.textTheme.bodyText2,
                textAlign: TextAlign.start,
                maxLines: 2),
          ],
        ),
      ),
    );
  }
}
