import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_destination_wallet_page.dart';
import 'package:flutter/services.dart';
import '../../../dfinity.dart';
import '../wizard_overlay.dart';

class SelectSourceWallet extends StatefulWidget {
  const SelectSourceWallet({
    Key? key,
  }) : super(key: key);

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
                                  allAccounts.mapToList((e) => _AccountRow(
                                      account: e,
                                      onPressed: () {
                                        final address = e.accountIdentifier;
                                        final source =
                                            context.boxes.accounts[address]!;
                                        WizardOverlay.of(context).pushPage(
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
                  padding: const EdgeInsets.only(left: 16.0, bottom: 16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Expanded(
                          flex: 1,
                          child: IconButton(
                              constraints:
                                  BoxConstraints.tight(Size.square(20.0)),
                              padding: const EdgeInsets.all(0),
                              alignment: Alignment.center,
                              iconSize:
                                  context.textTheme.bodyText1?.fontSize ?? 24,
                              icon: Icon(
                                Icons.copy,
                                color: context.textTheme.bodyText1?.color,
                              ),
                              onPressed: () {
                                Clipboard.setData(ClipboardData(
                                    text: account.accountIdentifier));
                              })),
                      Expanded(
                          flex: 12,
                          child: AutoSizeText(account.accountIdentifier,
                              textAlign: TextAlign.start,
                              style: context.textTheme.bodyText1,
                              selectable: true,
                              maxLines: 2)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          BalanceDisplayWidget(
              amount: account.balance,
              amountSize: 30,
              icpLabelSize: 20,
              locale: myLocale.languageCode,
          )
        ],
      ),
    );
  }
}
