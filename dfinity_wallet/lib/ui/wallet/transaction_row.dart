import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';

enum TransactionType { SEND, RECEIVE }

class TransactionRow extends StatelessWidget {
  final Transaction transaction;
  final Account currentAccount;

  const TransactionRow(
      {Key? key, required this.transaction, required this.currentAccount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat.yMd().add_jm();
    var isReceive = transaction.from != currentAccount.accountIdentifier;
    var isSend = transaction.to != currentAccount.accountIdentifier;
    TransactionType type =
        isReceive ? TransactionType.RECEIVE : TransactionType.SEND;
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
                    Text(dateFormatter.format(transaction.date),
                        style: context.textTheme.headline3),
                    SmallFormDivider(),
                    if (isReceive)
                      SelectableText(
                        "Source: ${transaction.from}",
                        style: context.textTheme.bodyText2),
                    if (isSend)
                      SelectableText(
                        "To: ${transaction.to}",
                        style: context.textTheme.bodyText2,
                      ),
                    SizedBox(
                      height: 5,
                    ),
                  ],
                ),
              ),
              SizedBox(
                width: 20,
              ),
              TransactionAmountDisplayWidget(
                fee: transaction.fee.toBigInt.toICPT,
                transactionType: type,
                amount: transaction.icpt,
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
  final bool addition;
  final TransactionType transactionType;

  const TransactionAmountDisplayWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.addition,
      required this.transactionType})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    final sign = addition ? "+" : "-";
    final color = addition ? AppColors.green500 : AppColors.gray50;
    final secondaryColor = addition ? AppColors.green600 : AppColors.gray200;
    final showFee = transactionType == TransactionType.SEND;

    var displayAmount = amount + (showFee ? fee : 0);
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
