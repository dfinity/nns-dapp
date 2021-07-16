import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/canisters/confirm_canister_creation.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

import '../../dfinity.dart';
import 'cycles_input_widget.dart';

class NewCanisterCyclesAmountWidget extends StatefulWidget {
  final Account source;

  const NewCanisterCyclesAmountWidget({
    Key? key,
    required this.source,
  }) : super(key: key);

  @override
  _NewCanisterCyclesAmountWidgetState createState() =>
      _NewCanisterCyclesAmountWidgetState();
}

class _NewCanisterCyclesAmountWidgetState
    extends State<NewCanisterCyclesAmountWidget> {
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
      child: Padding(
        padding: Responsive.isMobile(context)
            ? const EdgeInsets.all(10.0)
            : const EdgeInsets.all(32.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
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
              SizedBox(
                  height: 70,
                  width: double.infinity,
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
                          "Review Canister Creation",
                          ConfirmCanisterCreationWidget(
                              amount: icpAmount!,
                              source: widget.source,
                              fromSubAccountId: widget.source.subAccountId,
                              trillionRatio: trillionRatio!));
                    }.takeIf((e) => icpAmount != null),
                  ))
            ],
          ),
        ),
      ),
    );
  }
}
