

import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/confirm_canister_creation.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'confirm_cycles_purchase.dart';
import 'cycles_input_widget.dart';

class NewCanisterCyclesAmountWidget extends StatefulWidget {
  final Account origin;
  final String name;

  const NewCanisterCyclesAmountWidget(
      {Key? key,
        required this.origin,
        required this.name,
      })
      : super(key: key);

  @override
  _NewCanisterCyclesAmountWidgetState createState() => _NewCanisterCyclesAmountWidgetState();
}


class _NewCanisterCyclesAmountWidgetState extends State<NewCanisterCyclesAmountWidget> {

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
            Expanded(child: Container()),
            SizedBox(
                height: 70,
                width: double.infinity,
                child: ElevatedButton(
                  child: Text("Review Cycles Purchase"),
                  onPressed: () async {
                    WizardOverlay.of(context).pushPage(
                        "Review Canister Creation",
                        ConfirmCanisterCreationWidget(
                          amount: icpAmount!.toDouble(),
                          origin: widget.origin,
                          name: widget.name,
                        ));
                  }.takeIf((e) => icpAmount != null),
                ))
          ],
        ),
      ),
    );
  }
}
