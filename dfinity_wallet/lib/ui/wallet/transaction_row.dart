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
                              amount: transaction.icptAmount,
                              amountSize: 30,
                              icpLabelSize: 20,
                          ),
                          SmallFormDivider(),
                          if (transaction.from != null)
                              Text(
                                  "From: ${transaction.from}",
                                  style: context.textTheme.bodyText2
                              ),
                          if (transaction.to != null)
                              Text(
                                  "To: ${transaction.to}",
                                  style: context.textTheme.bodyText2,
                              ),
                      ],
                  ),
                ),
            ),
        );
    }
}
