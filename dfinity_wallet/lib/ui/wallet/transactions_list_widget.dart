import 'package:dfinity_wallet/ui/wallet/transaction_row.dart';

import '../../dfinity.dart';

class TransactionsListWidget extends StatelessWidget {
  final Account? account;

  const TransactionsListWidget({Key? key, required this.account})
      : super(key: key);

  @override
  Widget build(BuildContext context) {

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: account?.transactions.mapToList((e) => TransactionRow(transaction: e, currentAccount: account!)) ?? [],
    );
  }
}
