import 'package:nns_dapp/ui/wallet/transaction_row.dart';

import '../../nns_dapp.dart';

class TransactionsListWidget extends StatelessWidget {
  final Account? account;

  const TransactionsListWidget({Key? key, required this.account})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 20,
        ),
        ...account?.transactions.mapToList((e) =>
                TransactionRow(transaction: e, currentAccount: account!)) ??
            []
      ],
    );
  }
}
