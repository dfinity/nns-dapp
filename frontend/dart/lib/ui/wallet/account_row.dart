import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:flutter/services.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import '../../dfinity.dart';
import 'balance_display_widget.dart';

class AccountRow extends StatelessWidget {
  final Account account;
  final Function onTap;

  const AccountRow({Key? key, required this.account, required this.onTap})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    return Card(
      margin: EdgeInsets.only(left: 0, right: 0, bottom: 16),
      color:
          account.primary ? AppColors.mediumBackground : AppColors.background,
      child: TextButton(
        onPressed: () {
          this.onTap();
        },
        child: Container(
          child: Padding(
            padding: const EdgeInsets.all(25),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        account.name,
                        style: Responsive.isMobile(context)
                            ? context.textTheme.headline6
                            : context.textTheme.headline3,
                      ),
                    ),
                    Expanded(
                      child: BalanceDisplayWidget(
                          amount: account.balance,
                          amountSize: Responsive.isMobile(context) ? 16 : 24,
                          icpLabelSize: 25,
                          locale: myLocale.languageCode),
                    )
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Flexible(
                      child: Text(account.accountIdentifier,
                          style: context.textTheme.bodyText2),
                    ),
                    IconButton(
                        alignment: Alignment.center,
                        iconSize: context.textTheme.bodyText1?.fontSize ?? 24,
                        icon: Icon(
                          Icons.copy,
                          color: context.textTheme.bodyText1?.color,
                        ),
                        onPressed: () {
                          Clipboard.setData(
                              ClipboardData(text: account.accountIdentifier));
                        })
                  ],
                ),
                if (!account.primary) SmallFormDivider(),
                if (!account.primary)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text(
                        account.hardwareWallet
                            ? "HARDWARE WALLET"
                            : "LINKED ACCOUNT",
                        style: context.textTheme.bodyText2,
                      ),
                    ],
                  )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
