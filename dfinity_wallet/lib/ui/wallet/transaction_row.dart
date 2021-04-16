import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';

class TransactionRow extends StatelessWidget {
  final Transaction transaction;
  final Account currentAccount;

  const TransactionRow(
      {Key? key, required this.transaction, required this.currentAccount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                    Text(
                        (transaction.from == currentAccount.accountIdentifier)
                            ? "Sent"
                            : "Received",
                        style: context.textTheme.headline3),
                    SmallFormDivider(),
                    if (transaction.from != currentAccount.accountIdentifier)
                      Text("From: ${transaction.from}",
                          style: context.textTheme.bodyText2),
                    if (transaction.to != currentAccount.accountIdentifier)
                      Text(
                        "To: ${transaction.to}",
                        style: context.textTheme.bodyText2?.copyWith(fontSize: 16),
                      ),
                    SizedBox(height: 5,),
                    Text("${transaction.date.toString()}")
                  ],
                ),
              ),
              SizedBox(width: 20,),
              BalanceDisplayWidget(
                amount: transaction.icpt,
                amountSize: 30,
                icpLabelSize: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
