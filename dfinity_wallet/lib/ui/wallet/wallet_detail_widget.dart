import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/wallet/transaction_row.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';

class WalletDetailPage extends StatefulWidget {
    final String walletIdentifier;
    WalletDetailPage({required this.walletIdentifier});


  @override
  _WalletDetailPageState createState() => _WalletDetailPageState();
}

class _WalletDetailPageState extends State<WalletDetailPage> {
    
     late Wallet wallet;


  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    wallet = context.boxes.wallets.values.firstWhere((element) => element.identifier == widget.walletIdentifier);
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.background,
        title: Text(wallet.name),
      ),
      body: Container(
        color: AppColors.lightBackground,
        child: FooterGradientButton(
            body: Column(
              children: [
                Padding(
                    padding: EdgeInsets.all(24),
                    child: BalanceDisplayWidget(
                      amount: wallet.balance,
                      amountSize: 50,
                      icpLabelSize: 25,
                    )),
                if (wallet.transactions.isEmpty)
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
                                child: Text("Create Demo Transactions"),
                              ),
                              onPressed: () {
                                setState(() {
                                    final transactions = 0.rangeTo(3).map((e) => Transaction(fromKey: Uuid().v4(), amount: rand.nextInt(10000) / 100, date: DateTime.now()));
                                    transactions.forEach((e) {
                                      wallet.transactions.add(e);
                                    });
                                });
                              })
                        ],
                      ),
                    ),
                  ),
                ...wallet.transactions.map((e) => TransactionRow(transaction: e))
              ],
            ),
            footer: Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(child: Text("New Transaction"), onPressed: () {}),
            ))
      ),
    );

    // Expanded(
    //   child: SizedBox.expand(
    //     child: Padding(
    //       padding: const EdgeInsets.all(8.0),
    //       child: ElevatedButton(
    //               child: Text("Top up Canister"),
    //               onPressed: () {
    //                 showDialog(
    //                         context: context,
    //                         builder: (context) {
    //                           return TopUpCanisterWidget(
    //                             wallet: widget.wallet,
    //                           );
    //                         });
    //               }),
    //     ),
    //   ),
    // ),

    // Container(
    //   padding: const EdgeInsets.all(8.0),
    //   child: SizedBox(
    //     height: 80,
    //     width: double.infinity,
    //     child: ElevatedButton(
    //       child: Text(
    //         "New Canister",
    //         style: context.textTheme.bodyText1?.copyWith(fontSize: 24),
    //       ),
    //       onPressed: () {
    //         showDialog(
    //                 context: context,
    //                 builder: (context) => Center(
    //                         child: SizedBox(
    //                                 width: 500,
    //                                 child: TextFieldDialogWidget(
    //                                         title: "New Canister",
    //                                         buttonTitle: "Create",
    //                                         fieldName: "Canister Name",
    //                                         onComplete: (name) {
    //                                           setState(() {
    //                                             AppState.shared.canisters.add(Canister(name, WalletService.uuid.v4()));
    //                                           });
    //                                         }))));
    //       },
    //     ),
    //   ),
    // );
  }
}
