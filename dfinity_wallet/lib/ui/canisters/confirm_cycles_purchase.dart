import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';


class ConfirmCyclesPurchase extends StatelessWidget {
  final double amount;
  final ICPSource source;
  final Canister destination;
  final BigInt trillionAmount;

  const ConfirmCyclesPurchase({Key? key,
    required this.amount,
    required this.source,
    required this.destination,
    required this.trillionAmount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
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
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            mainAxisAlignment: MainAxisAlignment.center,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                amount.toDisplayICPT(myLocale.languageCode),
                                style: TextStyle(color: AppColors.white,
                                    fontFamily: Fonts.circularBold,
                                    fontSize: 50),
                              ),
                              SizedBox(
                                width: 7,
                              ),
                              Text("ICP",
                                  style: TextStyle(color: AppColors.gray200,
                                      fontFamily: Fonts.circularBook,
                                      fontSize: 50 * 0.4))
                            ],
                          ),
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.only(left: 24, right: 24),
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
                                CycleCalculator(trillionAmount).icpToTrillionCycles(amount).toDisplayICPT(myLocale.languageCode),
                                style: TextStyle(color: AppColors.white,
                                    fontFamily: Fonts.circularBold,
                                    fontSize: 50),
                              ),
                              SizedBox(
                                width: 7,
                              ),
                              Text("T Cycles",
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
                      Text("Source", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(source.address, style: context.textTheme.bodyText1),
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

                        await context.callUpdate(() => context.icApi.topupCanister(
                            stake: amount.toE8s,
                            targetCanisterId: destination.identifier,
                            fromSubAccountId: source.subAccountId
                        ));

                        WizardOverlay.of(context).replacePage(
                            "Transaction Completed!",
                            TransactionDoneWidget(
                              amount: amount,
                              source: source,
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

