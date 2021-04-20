
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';

import '../../../dfinity.dart';
import '../create_transaction_overlay.dart';

class ConfirmTransactionWidget extends StatelessWidget {
  final double amount;
  final String origin;
  final String destination;
  final int? subAccountId;

  const ConfirmTransactionWidget(
      {Key? key,
        required this.amount,
        required this.origin,
        required this.destination,
        required this.subAccountId})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                TransactionDetailsWidget(
                  origin: origin,
                  destination: destination,
                  amount: amount,
                ),
                Expanded(child: Container()),
                SizedBox(
                  height: 70,
                  width: double.infinity,
                  child: ElevatedButton(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text("Confirm and Send"),
                      ),
                      onPressed: () async {
                        await context.performLoading(() => context.icApi.sendICPTs(
                            toAccount: destination,
                            doms: amount.toDoms,
                            fromSubAccount: subAccountId));

                        NewTransactionOverlay.of(context).replacePage(
                            "Transaction Completed!",
                            TransactionDoneWidget(
                              amount: amount,
                              origin: origin,
                              destination: destination,
                            ));
                      }),
                ),
                SmallFormDivider()
              ],
            ),
          ),
        ));
  }
}

