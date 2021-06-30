import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ic_api/web/service_api.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class ConfirmCanisterCreationWidget extends StatelessWidget {
  final ICP amount;
  final ICPSource source;
  final BigInt trillionRatio;
  final int? fromSubAccountId;

  const ConfirmCanisterCreationWidget(
      {Key? key,
      required this.amount,
      required this.source,
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
                            amount.asString(myLocale.languageCode),
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
                            CycleCalculator(trillionRatio).icpToCycles(amount).asStringT(myLocale.languageCode),
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
                  Text("Source", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(source.address, style: context.textTheme.bodyText1),
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
                        .createCanister(amount: amount, fromSubAccountId: fromSubAccountId));
                    if (result == null) {
                      return;
                    }
                    if (result.canister != null) {
                      context.nav.push(
                      CanisterPageDef.createPageConfig(result.canister!));
                    } else if (result.errorMessage != null)
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description:"Error - ${result.errorMessage}",
                              onConfirm: () {},
                            ));
                    }
                  ),
            ),
            SmallFormDivider()
          ],
        ),
      ),
    ));
  }
}
