import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class ConfirmCyclesPurchase extends StatelessWidget {
  final ICP amount;
  final ICPSource source;
  final Canister destination;
  final BigInt trillionAmount;

  const ConfirmCyclesPurchase(
      {Key? key,
      required this.amount,
      required this.source,
      required this.destination,
      required this.trillionAmount})
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
              Text(
                "ICP",
                style: TextStyle(
                  color: AppColors.gray200,
                  fontFamily: Fonts.circularBook,
                  fontSize: Responsive.isMobile(context) ? 10 : 15,
                ),
              )
            ],
          ),
        ),
      ),
      Padding(
        padding: const EdgeInsets.only(top: 24.0),
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
                CycleCalculator(trillionAmount).icpToCycles(amount).asStringT(),
                style: TextStyle(
                    color: AppColors.white,
                    fontFamily: Fonts.circularBold,
                    fontSize: Responsive.isMobile(context) ? 20 : 30),
              ),
              SizedBox(
                width: 7,
              ),
              Text(
                "T Cycles",
                style: TextStyle(
                  color: AppColors.gray200,
                  fontFamily: Fonts.circularBook,
                  fontSize: Responsive.isMobile(context) ? 10 : 15,
                ),
              )
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
                    Text("Destination",
                        style: Responsive.isDesktop(context) |
                                Responsive.isTablet(context)
                            ? context.textTheme.headline3
                            : context.textTheme.headline4),
                    VerySmallFormDivider(),
                    Text(destination.identifier,
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
                width: MediaQuery.of(context).size.width * 0.60,
                child: ElevatedButton(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        "Confirm and Send",
                        style: TextStyle(
                            fontSize: Responsive.isTablet(context) |
                                    Responsive.isDesktop(context)
                                ? kTextSizeLarge
                                : kTextSizeSmall),
                      ),
                    ),
                    onPressed: () async {
                      await context.callUpdate(() => context.icApi
                          .topUpCanister(
                              amount: amount,
                              canisterId: destination.identifier,
                              fromSubAccountId: source.subAccountId));

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
      )),
    );
  }
}
