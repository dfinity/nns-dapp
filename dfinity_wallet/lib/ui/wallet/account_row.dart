import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
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
      child: FlatButton(
        onPressed: () {
          this.onTap();
        },
        child: Container(
          //width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.all(25.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              //crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        account.name,
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline2
                            : context.textTheme.headline3,
                      ),
                    ),
                    Expanded(
                      child: BalanceDisplayWidget(
                          amount: account.balance,
                          amountSize: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? 30
                              : 24,
                          icpLabelSize: 25,
                          locale: myLocale.languageCode),
                    )
                  ],
                ),
                // SizedBox(
                //   height: 30.0,
                // ),
                Row(
                  // crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    SizedBox(
                        width: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? 500
                            : 200,
                        child: Padding(
                          padding: Responsive.isDesktop(context) |
                                  Responsive.isTablet(context)
                              ? const EdgeInsets.only(top: 20.0)
                              : const EdgeInsets.only(top: 8.0),
                          child: SelectableText.rich(
                            TextSpan(
                              text: account.accountIdentifier,
                              style: context.textTheme.bodyText2,
                            ),

                            textAlign: TextAlign.start,
                            // selectable: true,
                            maxLines: 2,
                          ),
                        )),
                    IconButton(
                        padding: const EdgeInsets.only(top: 0, left: 5),
                        alignment: Alignment.center,
                        iconSize: context.textTheme.bodyText1?.fontSize ?? 24,
                        icon: Icon(
                          Icons.copy,
                          color: context.textTheme.bodyText1?.color,
                        ),
                        onPressed: () {
                          Clipboard.setData(
                              ClipboardData(text: account.accountIdentifier));
                        }),
                  ],
                ),
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
