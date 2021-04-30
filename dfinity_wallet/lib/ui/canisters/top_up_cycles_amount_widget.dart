import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'confirm_cycles_purchase.dart';
import 'cycles_input_widget.dart';



class TopUpCyclesAmountWidget extends StatefulWidget {
  final Account origin;
  final Canister destinationCanister;

  const TopUpCyclesAmountWidget(
      {Key? key,
        required this.origin,
        required this.destinationCanister
      })
      : super(key: key);

  @override
  _TopUpCyclesAmountWidgetState createState() => _TopUpCyclesAmountWidgetState();
}


class _TopUpCyclesAmountWidgetState extends State<TopUpCyclesAmountWidget> {

  double? icpAmount;

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: CycleInputWidget(origin: widget.origin, onChange: (double? icps) {
                  setState(() {
                    icpAmount = icps;
                  });
                }),
              ),
            ),
            TallFormDivider(),
            IntrinsicWidth(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Origin Wallet", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(widget.origin.address,
                      style: context.textTheme.bodyText1),
                  TallFormDivider(),
                  Text("Canister", style: context.textTheme.headline4),
                  VerySmallFormDivider(),
                  Text(widget.destinationCanister.identifier,
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
                  child: Text("Review Cycles Purchase"),
                  onPressed: () async {
                    NewTransactionOverlay.of(context).pushPage(
                        "Review Cycles Purchase",
                        ConfirmCyclesPurchase(
                          amount: icpAmount!.toDouble(),
                          origin: widget.origin.address,
                          destination: widget.destinationCanister,
                        ));
                  }.takeIf((e) => icpAmount != null),
                ))
          ],
        ),
      ),
    );
  }
}



