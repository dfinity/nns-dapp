
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:flutter/services.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class CycleInputWidget extends StatefulWidget {
  final Account source;
  final Function(double? icps) onChange;
  final BigInt? ratio;

  const CycleInputWidget(
      {Key? key,
        required this.source, required this.onChange, required this.ratio
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
          StringFieldValidation.insufficientFunds(widget.source.icpBalance, 2)
        ],
        inputType: TextInputType.number,
        inputFormatters: <TextInputFormatter>[ FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')) ]
        );

    cyclesField = ValidatedTextField("T Cycles",
        validations: [
          StringFieldValidation("Minimum amount: 2T cycles", (e) => (e.toDoubleOrNull() ?? 0) < 2),
        ],
        inputType: TextInputType.number);
  }

  void callCallback(){
    final amount = (icpField.failedValidation == null && cyclesField.failedValidation == null) ? icpField.currentValue.toDoubleOrNull() : null;
    widget.onChange(amount);
  }

  @override
  void didUpdateWidget(covariant CycleInputWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    setState(() {});
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
                        final newCyclesAmount = CycleCalculator(widget.ratio!).icpToTrillionCycles(icpField.currentValue.toDouble());
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
                        final newIcpAmount = CycleCalculator(widget.ratio!).cyclesToIcp(cyclesField.currentValue.toDouble());
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
              child: Text('''Minimum amount: 2T Cycles (inclusive of 1T Cycles fee to create the canister)

              Application subnets are in beta and therefore Cycles might be lost'''),
            )
          ],
        ),
      ),
    );
  }
}


