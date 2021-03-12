import 'package:dfinity_wallet/data/app_state.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/wallet/topup_canister_widget.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';

class WalletDetailWidget extends StatefulWidget {
  final Wallet wallet;

  const WalletDetailWidget({Key? key, required this.wallet}) : super(key: key);

  @override
  _WalletDetailWidgetState createState() => _WalletDetailWidgetState();
}

class _WalletDetailWidgetState extends State<WalletDetailWidget> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Wallet Details"),
      ),
      body: Column(
        children: [
          Expanded(
            child: TabTitleAndContent(
              title: widget.wallet.name,
              children: [
                Padding(
                  padding: EdgeInsets.only(left: 24.0, bottom: 24.0),
                  child: Text(
                    "Balance: ${widget.wallet.transactions.sumBy((element) => element.amount)}",
                    style: context.textTheme.headline3,
                  ),
                ),
                if (widget.wallet.transactions.isEmpty)
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
                              style: ButtonStyle(backgroundColor: MaterialStateProperty.all(AppColors.gray100)),
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Text("Create Demo Transactions"),
                              ),
                              onPressed: () {
                                setState(() {
                                  widget.wallet.transactions.addAll(0
                                      .rangeTo(3)
                                      .map((e) => Transaction(fromKey: Uuid().v4(), amount: rand.nextInt(10000) / 100)));
                                });
                              })
                        ],
                      ),
                    ),
                  ),
                ...widget.wallet.transactions.map((e) => TransactionRow(transaction: e))
              ],
            ),
          ),
          SizedBox(
            height: 80,
            child: Container(
              color: AppColors.gray400,
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox.expand(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ElevatedButton(
                            child: Text("Top up Canister"),
                            onPressed: () {
                              showDialog(
                                  context: context,
                                  builder: (context) {
                                    return TopUpCanisterWidget(
                                      wallet: widget.wallet,
                                    );
                                  });
                            }),
                      ),
                    ),
                  ),
                  Expanded(
                      child: SizedBox.expand(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ElevatedButton(child: Text("New Transaction"), onPressed: () {}),
                    ),
                  ))
                ],
              ),
            ),
          )
        ],
      ),
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
