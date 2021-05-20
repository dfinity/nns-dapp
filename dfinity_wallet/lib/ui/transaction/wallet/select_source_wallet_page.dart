import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_destination_wallet_page.dart';
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
    final otherAccounts = context.boxes.accounts.values.toList();
    return Container(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                                        final address = e.accountIdentifier;
                                        final source = context.boxes.accounts[address]!;
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
