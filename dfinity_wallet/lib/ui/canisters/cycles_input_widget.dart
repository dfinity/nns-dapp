
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'confirm_cycles_purchase.dart';
import 'cycle_calculator.dart';

class CycleInputWidget extends StatefulWidget {
  final Account origin;
  final Function(double? icps) onChange;

  const CycleInputWidget(
      {Key? key,
        required this.origin, required this.onChange,
      })
      : super(key: key);

  @override
  _CycleInputWidgetState createState() => _CycleInputWidgetState();
}


class _CycleInputWidgetState extends State<CycleInputWidget> {
  late ValidatedTextField icpField;
  late ValidatedTextField cyclesField;

  @override
  void initState() {
    super.initState();

    icpField = ValidatedTextField("Amount",
        validations: [
          FieldValidation("Must be greater than 0",
                  (e) {
                final amount = (e.toDoubleOrNull() ?? 0);
                return amount == 0;
              }),
          FieldValidation("Not enough ICP in account",
                  (e) {
                final amount = (e.toDoubleOrNull() ?? 0);
                return amount > widget.origin.icpBalance;
              })
        ],
        inputType: TextInputType.number);

    cyclesField = ValidatedTextField("T Cycles",
        validations: [],
        inputType: TextInputType.number);
  }

  void callCallback(){
    final amount = (icpField.failedValidation == null) ? icpField.currentValue.toDoubleOrNull() : null;
    widget.onChange(amount);
  }


  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(6.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text("ICP", style: context.textTheme.headline3),
                      DebouncedValidatedFormField(icpField, onChanged: () {
                        final newCyclesAmount = CycleCalculator.icpToCycles(icpField.currentValue.toDouble());
                        if(cyclesField.currentValue != newCyclesAmount.toString()){
                          cyclesField.textEditingController.text = newCyclesAmount.toString();
                        }
                        callCallback();
                      }),
                    ],
                  ),
                ),
                SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text("T Cycles", style: context.textTheme.headline3),
                      DebouncedValidatedFormField(cyclesField, onChanged: (){
                        final newIcpAmount = CycleCalculator.cyclesToIcp(cyclesField.currentValue.toDouble());
                        if(icpField.currentValue != newIcpAmount.toString()){
                          icpField.textEditingController.text = newIcpAmount.toString();
                        }
                        callCallback();
                      },),
                    ],
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text("Application subnets are beta and therefore Cycles might be lost"),
            )
          ],
        ),
      ),
    );
  }
}


