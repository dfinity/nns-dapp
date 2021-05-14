import 'package:dfinity_wallet/data/transaction_type.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

import '../../dfinity.dart';

class TransactionRow extends StatelessWidget {
  final Transaction transaction;
  final Account currentAccount;

  const TransactionRow(
      {Key? key, required this.transaction, required this.currentAccount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat.yMd().add_jm();
    final isReceive = transaction.from != currentAccount.accountIdentifier;
    final isSend = transaction.to != currentAccount.accountIdentifier;
    final isIncomplete = transaction.incomplete.isNotNullOrEmpty;

    return Card(
      color: Color(0xff292a2e),
      child: Container(
        width: double.infinity,
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(transaction.type.getName(),
                            style: context.textTheme.headline3),
                        if (isIncomplete)
                          Tooltip(
                              message:
                                  "Your last transaction seems to be missing. This can happen when the app loses connection during a transaction. To remedy, please click Retry",
                              child: TextButton(
                                child: Text("Retry"),
                                onPressed: () {
                                  context.icApi.retryStakeNeuronNotification(
                                      blockHeight: transaction.blockHeight,
                                      nonce: transaction.memo);
                                },
                              ))
                      ],
                    ),
                    VerySmallFormDivider(),
                    Text(dateFormatter.format(transaction.date),
                        style: context.textTheme.bodyText2),
                    VerySmallFormDivider(),
                    if (isReceive)
                      SelectableText("Source: ${transaction.from}",
                          style: context.textTheme.bodyText2),
                    if (isSend)
                      SelectableText(
                        "To: ${transaction.to}",
                        style: context.textTheme.bodyText2,
                      ),
                  ],
                ),
              ),
              SizedBox(
                width: 20,
              ),
              TransactionAmountDisplayWidget(
                fee: transaction.fee.toBigInt.toICPT,
                amount: transaction.icpt,
                type: transaction.type,
                addition: transaction.from != currentAccount.accountIdentifier,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TransactionAmountDisplayWidget extends StatelessWidget {
  final double amount;
  final double fee;
  final TransactionType type;
  final bool addition;

  const TransactionAmountDisplayWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.type,
      required this.addition})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    final sign = addition ? "+" : "-";
    final color = addition ? AppColors.green500 : AppColors.gray50;
    final secondaryColor = addition ? AppColors.green600 : AppColors.gray200;

    final displayAmount = amount + (type.shouldShowFee() ? this.fee : 0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          "$sign${(displayAmount).toDisplayICPT(myLocale.languageCode)}",
          style: TextStyle(
              color: color,
              fontFamily: Fonts.circularBold,
              fontSize: 30.toDouble()),
        ),
        SizedBox(
          width: 7,
        ),
        Text("ICP",
            style: TextStyle(
                color: secondaryColor,
                fontFamily: Fonts.circularBook,
                fontSize: 20.0))
      ],
    );
  }
}
