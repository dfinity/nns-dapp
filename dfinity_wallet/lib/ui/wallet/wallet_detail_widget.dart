import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';

import '../../dfinity.dart';

class WalletDetailWidget extends StatefulWidget {
  final Wallet wallet;

  const WalletDetailWidget({Key? key, required this.wallet}) : super(key: key);

  @override
  _WalletDetailWidgetState createState() => _WalletDetailWidgetState();
}

class _WalletDetailWidgetState extends State<WalletDetailWidget> {
  late TransactionService transactionService;

  @override
  void initState() {
    super.initState();
    transactionService = TransactionService(widget.wallet);
    transactionService.fetchTransactions();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Wallet Details"),
      ),
      body: TabTitleAndContent(
          title: widget.wallet.name,
          content: Column(
            children: [
              Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  "Balance: ${transactionService.transactions.sumBy((element) => element.amount)}",
                  style: context.textTheme.headline2,
                ),
              ),
              Expanded(child: ListView(children: [
                ...transactionService.transactions.map((e) => TransactionRow(transaction: e))
              ],))
            ],
          )),
    );
  }
}

class TransactionRow extends StatelessWidget {
  final Transaction transaction;

  const TransactionRow({Key? key, required this.transaction}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (transaction.fromKey != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  "From: ${transaction.fromKey!}",
                  style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
            if (transaction.toKey != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  "To: ${transaction.toKey!}",
                  style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
            Padding(
              padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
              child: Text(
                "Quantity: ${transaction.amount}",
                style: context.textTheme.bodyText2?.copyWith(color: AppColors.gray800),
              ),
            )
          ],
        ),
      ),
    );
  }
}
