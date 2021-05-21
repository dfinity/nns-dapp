import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:flutter/services.dart';

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
                          child: AutoSizeText(
                            account.name,
                            maxLines: 1,
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
                    left: 16.0, bottom: 16.0),
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
              if (!account.primary)
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: Text(
                    account.hardwareWallet
                        ? "HARDWARE WALLET"
                        : "LINKED ACCOUNT",
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
