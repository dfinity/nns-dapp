import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';

class TransactionRow extends StatelessWidget {
    final Transaction transaction;

    const TransactionRow({Key? key, required this.transaction}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Card(
            color: Color(0xff292a2e),
            child: Container(
                width: double.infinity,
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                          BalanceDisplayWidget(
                              amount: transaction.amount,
                              amountSize: 30,
                              icpLabelSize: 20,
                          ),
                          SmallFormDivider(),
                          if (transaction.fromKey != null)
                              Text(
                                  "From: ${transaction.fromKey!}",
                                  style: context.textTheme.bodyText2
                              ),
                          if (transaction.toKey != null)
                              Text(
                                  "To: ${transaction.toKey!}",
                                  style: context.textTheme.bodyText2,
                              ),
                      ],
                  ),
                ),
            ),
        );
    }
}
