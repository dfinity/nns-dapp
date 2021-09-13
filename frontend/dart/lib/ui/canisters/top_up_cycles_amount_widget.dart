import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/transaction/wizard_overlay.dart';

import '../../nns_dapp.dart';
import 'confirm_cycles_purchase.dart';
import 'cycles_input_widget.dart';

class TopUpCyclesAmountWidget extends StatefulWidget {
  final Account source;
  final Canister destinationCanister;

  const TopUpCyclesAmountWidget(
      {Key? key, required this.source, required this.destinationCanister})
      : super(key: key);

  @override
  _TopUpCyclesAmountWidgetState createState() =>
      _TopUpCyclesAmountWidgetState();
}

class _TopUpCyclesAmountWidgetState extends State<TopUpCyclesAmountWidget> {
  ICP? icpAmount;
  BigInt? trillionRatio;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    context.icApi.getICPToCyclesExchangeRate().then((value) => setState(() {
          trillionRatio = value;
        }));
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: SingleChildScrollView(
        child: Padding(
          padding: Responsive.isMobile(context)
              ? const EdgeInsets.all(5.0)
              : const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (trillionRatio == null)
                Padding(
                  padding: const EdgeInsets.all(18.0),
                  child: Center(child: Text("Fetching conversion rate...")),
                ),
              if (trillionRatio != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: CycleInputWidget(
                        ratio: trillionRatio,
                        source: widget.source,
                        onChange: (ICP? icps) {
                          setState(() {
                            icpAmount = icps;
                          });
                        }),
                  ),
                ),
              TallFormDivider(),
              IntrinsicWidth(
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Source Wallet", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(widget.source.address,
                          style: Responsive.isMobile(context)
                              ? context.textTheme.bodyText2
                              : context.textTheme.bodyText1),
                      TallFormDivider(),
                      Text("Canister", style: context.textTheme.headline4),
                      VerySmallFormDivider(),
                      Text(widget.destinationCanister.identifier,
                          style: Responsive.isMobile(context)
                              ? context.textTheme.bodyText2
                              : context.textTheme.bodyText1),
                      TallFormDivider(),
                    ],
                  ),
                ),
              ),
              SizedBox(
                  height: 70,
                  width: Responsive.isMobile(context)
                      ? MediaQuery.of(context).size.width * 0.60
                      : double.infinity,
                  child: ElevatedButton(
                    child: Text(
                      "Review Cycles Purchase",
                      style: TextStyle(
                        fontSize: Responsive.isTablet(context) |
                                Responsive.isDesktop(context)
                            ? kTextSizeLarge
                            : kTextSizeSmall,
                      ),
                    ),
                    onPressed: () async {
                      WizardOverlay.of(context).pushPage(
                          "Review Cycles Purchase",
                          ConfirmCyclesPurchase(
                            amount: icpAmount!,
                            source: widget.source,
                            destination: widget.destinationCanister,
                            trillionAmount: trillionRatio!,
                          ));
                    }.takeIf((e) => icpAmount != null && trillionRatio != null),
                  ))
            ],
          ),
        ),
      ),
    );
  }
}
