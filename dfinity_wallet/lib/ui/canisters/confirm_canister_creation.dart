import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:intl/intl.dart';
import 'package:dfinity_wallet/ic_api/web/service_api.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class ConfirmCanisterCreationWidget extends StatelessWidget {
  final double amount;
  final ICPSource source;
  final String name;
  final BigInt trillionRatio;
  final int? fromSubAccountId;

  const ConfirmCanisterCreationWidget(
      {Key? key,
      required this.amount,
      required this.source,
      required this.name,
      required this.trillionRatio,
      required this.fromSubAccountId})
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
                            style: TextStyle(
                                color: AppColors.white,
                                fontFamily: Fonts.circularBold,
                                fontSize: 50),
                          ),
                          SizedBox(
                            width: 7,
                          ),
                          Text("ICP",
                              style: TextStyle(
                                  color: AppColors.gray200,
                                  fontFamily: Fonts.circularBook,
                                  fontSize: 50 * 0.4))
                        ],
                      ),
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.only(left: 24, right: 24),
                    child: Text("converted to"),
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
                            CycleCalculator(trillionRatio).icpToTrillionCycles(amount).toDisplayICPT(myLocale.languageCode),
                            style: TextStyle(
                                color: AppColors.white,
                                fontFamily: Fonts.circularBold,
                                fontSize: 50),
                          ),
                          SizedBox(
                            width: 7,
                          ),
                          Text("T Cycles",
                              style: TextStyle(
                                  color: AppColors.gray200,
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
                children: [
                  TallFormDivider(),
                  Text("Canister Name", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(name, style: context.textTheme.bodyText1),
                  TallFormDivider(),
                  Text("Source", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  ResponsiveCopyId(accountIdentifier: source.address),
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
                    final result = await context.callUpdate(() => context
                        .icApi
                        .createCanister(stake: amount.toE8s, name: name, fromSubAccountId: fromSubAccountId));
                    if (result == null) {
                      return;
                    }
                    switch (result.result){
                      case CreateCanisterResult.Ok:

                        context.nav.push(
                            CanisterPageDef.createPageConfig(result.canister!));
                        break;
                      case CreateCanisterResult.FailedToCreateCanister:
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description:"Error - ${result.errorMessage}",
                              onConfirm: () {},
                            ));
                        break;
                      case CreateCanisterResult.CanisterAlreadyAttached:
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description:"Canister Already Attached - ${result.errorMessage}",
                              onConfirm: () {},
                            ));
                        break;
                      case CreateCanisterResult.NameAlreadyTaken:
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description:"Name Already Taken",
                              onConfirm: () {},
                            ));
                        break;
                      case CreateCanisterResult.CanisterLimitExceeded:
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description:"CanisterLimitExceeded",
                              onConfirm: () {},
                            ));
                        break;
                    }

                    // if (result.canister != null) {
                    //
                    // } else {
                    //   print("Canister id ${result.canisterId}");
                    //   OverlayBaseWidget.show(
                    //       context,
                    //       ConfirmDialog(
                    //         title: "Critical Error - ${result.canisterId}",
                    //         description:
                    //             "${result.canisterId} has been created, but could not be linked to this account.  Record the Canister ID and contact support",
                    //         onConfirm: () {},
                    //       ));
                    // }
                  }),
            ),
            SmallFormDivider()
          ],
        ),
      ),
    ));
  }
}
