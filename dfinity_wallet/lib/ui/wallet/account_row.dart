import '../../dfinity.dart';
import 'balance_display_widget.dart';

class AccountRow extends StatelessWidget {
  final Account account;
  final Function onTap;

  const AccountRow({Key? key, required this.account, required this.onTap})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(left: 0, right: 0, bottom: 16),
      color:
          account.primary ? AppColors.mediumBackground : AppColors.background,
      child: FlatButton(
        onPressed: () {
          this.onTap();
        },
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                      ],
                    ),
                  ),
                  BalanceDisplayWidget(
                      amount: account.icpBalance,
                      amountSize: 30,
                      icpLabelSize: 20)
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: SelectableText(
                  account.accountIdentifier.characters.toString(),
                  style: context.textTheme.bodyText1,
                ),
              ),
              if (!account.primary)
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: Text(
                    account.hardwareWallet ? "HARDWARE WALLET" : "LINKED ACCOUNT",
                    style: context.textTheme.bodyText2,
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }
}
