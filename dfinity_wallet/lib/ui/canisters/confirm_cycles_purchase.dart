import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';


class ConfirmCyclesPurchase extends StatelessWidget {
  final double amount;
  final String origin;
  final Canister destination;

  const ConfirmCyclesPurchase({Key? key,
    required this.amount,
    required this.origin,
    required this.destination})
      : super(key: key);

  double get numCycles => amount * 50;

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              children: [
                TallFormDivider(),
                Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: BalanceDisplayWidget(
                            amount: amount,
                            amountSize: 50,
                            icpLabelSize: 0,
                          ),
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.only(left: 24, right: 24, top: 48),
                        child: Text(
                            "converted to"
                        ),
                      ),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            mainAxisAlignment: MainAxisAlignment.center,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                NumberFormat("###,###.########", "en_US")
                                    .format(numCycles),
                                style: TextStyle(color: AppColors.white,
                                    fontFamily: Fonts.circularBold,
                                    fontSize: 50),
                              ),
                              SizedBox(
                                width: 7,
                              ),
                              Text("Cycles",
                                  style: TextStyle(color: AppColors.gray200,
                                      fontFamily: Fonts.circularBook,
                                      fontSize: 50 * 0.4))
                            ],
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                IntrinsicWidth(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [TallFormDivider(),
                      Text("Origin", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(origin, style: context.textTheme.bodyText1),
                      TallFormDivider(),
                      Text("Destination", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(destination.identifier,
                          style: context.textTheme.bodyText1),
                      TallFormDivider(),
                    ],
                  ),
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
                        await context.performLoading(() async {
                          await 1.0.seconds.delay;
                          destination.cyclesAdded += (amount * 50).toInt();
                          destination.save();
                        });

                        NewTransactionOverlay.of(context).replacePage(
                            "Transaction Completed!",
                            TransactionDoneWidget(
                              amount: amount,
                              origin: origin,
                              destination: destination.identifier,
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

