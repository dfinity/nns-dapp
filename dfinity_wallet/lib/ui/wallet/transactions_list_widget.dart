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
      children: [
        if (account?.transactions.isEmpty ?? true)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 100),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text(
                      "No transactions!\n\n Your wallet is empty until ICPs are deposited with a transaction",
                      style: context.textTheme.bodyText1,
                      textAlign: TextAlign.center,
                    ),
                  ),
                  TextButton(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Text("Receive IC"),
                      ),
                      onPressed: () async {
                        LoadingOverlay.of(context).showOverlay();
                        await context.icApi.acquireICPTs(
                            accountIdentifier: account!.accountIdentifier,
                            doms: BigInt.from(1500000000));
                        LoadingOverlay.of(context).hideOverlay();
                      })
                ],
              ),
            ),
          ),
        ...account?.transactions.map((e) =>
                TransactionRow(transaction: e, currentAccount: account!)) ??
            [],
      ],
    );
  }
}
