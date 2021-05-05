import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class ConfirmCanisterCreationWidget extends StatelessWidget {
  final double amount;
  final ICPSource origin;
  final String name;

  const ConfirmCanisterCreationWidget({Key? key,
    required this.amount,
    required this.origin,
    required this.name})
      : super(key: key);

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
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            mainAxisAlignment: MainAxisAlignment.center,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                amount.toDisplayICPT,
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
                                CycleCalculator.icpToCycles(amount).toDisplayICPT,
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
                      Text("Canister Name", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(name, style: context.textTheme.bodyText1),
                      TallFormDivider(),
                      Text("Origin", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(origin.address, style: context.textTheme.bodyText1),
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
                        child: Text("Confirm"),
                      ),
                      onPressed: () async {
                        await context.performLoading(() async {
                          await 4.0.seconds.delay;
                        });

                        await context.icApi.createCanister(stake: amount.toE8s, name: name);

                        // WizardOverlay.of(context).replacePage(
                        //     "Transaction Completed!",
                        //     TransactionDoneWidget(
                        //       amount: amount,
                        //       origin: origin,
                        //       destination: canister.identifier,
                        //     ));
                      }),
                ),
                SmallFormDivider()
              ],
            ),
          ),
        ));
  }
}

