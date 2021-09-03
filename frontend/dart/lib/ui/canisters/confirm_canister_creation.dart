import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';

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
    var cyclesPurchasedWidget = [
      Card(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                amount.asString(),
                style: TextStyle(
                    color: AppColors.white,
                    fontFamily: Fonts.circularBold,
                    fontSize: Responsive.isMobile(context) ? 20 : 30),
              ),
              SizedBox(
                width: 7,
              ),
              Text("ICP",
                  style: TextStyle(
                      color: AppColors.gray200,
                      fontFamily: Fonts.circularBook,
                      fontSize: Responsive.isMobile(context) ? 10 : 15))
            ],
          ),
        ),
      ),
      Container(
        padding: EdgeInsets.only(top: 24),
        child: Text("converted to"),
      ),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                CycleCalculator(trillionRatio).icpToCycles(amount).asStringT(),
                style: TextStyle(
                    color: AppColors.white,
                    fontFamily: Fonts.circularBold,
                    fontSize: Responsive.isMobile(context) ? 20 : 30),
              ),
              SizedBox(
                width: 7,
              ),
              Text("T Cycles",
                  style: TextStyle(
                      color: AppColors.gray200,
                      fontFamily: Fonts.circularBook,
                      fontSize: Responsive.isMobile(context) ? 10 : 15))
            ],
          ),
        ),
      )
    ];
    return SingleChildScrollView(
      child: Container(
          child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 10.0),
          child: Column(
            children: [
              TallFormDivider(),
              Center(
                  child: Responsive.isMobile(context)
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [...cyclesPurchasedWidget],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [...cyclesPurchasedWidget],
                        )),
              IntrinsicWidth(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TallFormDivider(),
                    Text("Source",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline3
                            : context.textTheme.headline4),
                    VerySmallFormDivider(),
                    Text(source.address,
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.bodyText1
                            : context.textTheme.bodyText2),
                    TallFormDivider(),
                  ],
                ),
              ),
              SizedBox(
                height: 70,
                width: double.infinity,
                child: ElevatedButton(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text("Confirm"),
                    ),
                    onPressed: () async {
                      final result = await context.callUpdate(() =>
                          context.icApi.createCanister(
                              amount: amount,
                              fromSubAccountId: fromSubAccountId));
                      if (result == null) {
                        return;
                      }
                      if (result.canister != null) {
                        context.nav.push(
                            canisterPageDef.createPageConfig(result.canister!));
                      } else if (result.errorMessage != null)
                        OverlayBaseWidget.show(
                            context,
                            ConfirmDialog(
                              title: "Failed to Create Canister",
                              description: "Error - ${result.errorMessage}",
                              onConfirm: () {},
                            ));
                    }),
              ),
              SmallFormDivider()
            ],
          ),
        ),
      )),
    );
  }
}
