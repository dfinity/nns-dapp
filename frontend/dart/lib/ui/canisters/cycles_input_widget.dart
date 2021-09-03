import 'package:dfinity_wallet/data/cycles.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:flutter/services.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';

class CycleInputWidget extends StatefulWidget {
  final Account source;
  final Function(ICP? icps) onChange;
  final BigInt? ratio;

  const CycleInputWidget(
      {Key? key,
      required this.source,
      required this.onChange,
      required this.ratio})
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
          StringFieldValidation.insufficientFunds(widget.source.balance, 2)
        ],
        inputType: TextInputType.number,
        inputFormatters: <TextInputFormatter>[ICPTextInputFormatter()]);

    cyclesField = ValidatedTextField("T Cycles",
        validations: [
          StringFieldValidation("Minimum amount: 2T cycles",
              (e) => (e.toDoubleOrNull() ?? 0) < 2),
        ],
        inputType: TextInputType.number);
  }

  void callCallback() {
    final amount = (icpField.failedValidation == null &&
            cyclesField.failedValidation == null)
        ? ICP.fromString(icpField.currentValue)
        : null;
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Responsive.isDesktop(context) || Responsive.isTablet(context)
                ? Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text("ICP", style: context.textTheme.headline3),
                            DebouncedValidatedFormField(icpField,
                                onChanged: () {
                              final newIcpValue = ICP.fromString(
                                  icpField.currentValue.isEmpty
                                      ? "0"
                                      : icpField.currentValue);
                              final newCyclesAmount =
                                  CycleCalculator(widget.ratio!)
                                      .icpToCycles(newIcpValue);
                              final currentCyclesAmount = Cycles.fromTs(
                                  cyclesField.currentValue.toDoubleOrNull() ??
                                      0);
                              if (newCyclesAmount.amount !=
                                  currentCyclesAmount.amount) {
                                cyclesField.textEditingController.text =
                                    newCyclesAmount.asStringT(
                                        withSeparators: false);
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
                            Text("T Cycles",
                                style: context.textTheme.headline3),
                            DebouncedValidatedFormField(
                              cyclesField,
                              onChanged: () {
                                final newCyclesAmount = Cycles.fromTs(
                                    cyclesField.currentValue.toDoubleOrNull() ??
                                        0);
                                final newIcpAmount =
                                    CycleCalculator(widget.ratio!)
                                        .cyclesToIcp(newCyclesAmount);
                                final currentIcpAmount = ICP.fromString(
                                    icpField.currentValue.isEmpty
                                        ? "0"
                                        : icpField.currentValue);
                                if (newIcpAmount.asE8s() !=
                                    currentIcpAmount.asE8s()) {
                                  icpField.textEditingController.text =
                                      newIcpAmount.asString(
                                          withSeparators: false);
                                }
                                callCallback();
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 8.0),
                            child:
                                Text("ICP", style: context.textTheme.headline6),
                          ),
                          DebouncedValidatedFormField(icpField, onChanged: () {
                            final newIcpValue = ICP.fromString(
                                icpField.currentValue.isEmpty
                                    ? "0"
                                    : icpField.currentValue);
                            final newCyclesAmount =
                                CycleCalculator(widget.ratio!)
                                    .icpToCycles(newIcpValue);
                            final currentCyclesAmount = Cycles.fromTs(
                                cyclesField.currentValue.toDoubleOrNull() ?? 0);
                            if (newCyclesAmount.amount !=
                                currentCyclesAmount.amount) {
                              cyclesField.textEditingController.text =
                                  newCyclesAmount.asStringT(
                                      withSeparators: false);
                            }
                            callCallback();
                          }),
                        ],
                      ),
                      SizedBox(width: 20),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text("T Cycles",
                                style: context.textTheme.headline6),
                          ),
                          DebouncedValidatedFormField(
                            cyclesField,
                            onChanged: () {
                              final newCyclesAmount = Cycles.fromTs(
                                  cyclesField.currentValue.toDoubleOrNull() ??
                                      0);
                              final newIcpAmount =
                                  CycleCalculator(widget.ratio!)
                                      .cyclesToIcp(newCyclesAmount);
                              final currentIcpAmount = ICP.fromString(
                                  icpField.currentValue.isEmpty
                                      ? "0"
                                      : icpField.currentValue);
                              if (newIcpAmount.asE8s() !=
                                  currentIcpAmount.asE8s()) {
                                icpField.textEditingController.text =
                                    newIcpAmount.asString(
                                        withSeparators: false);
                              }
                              callCallback();
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                      'Minimum amount: 2T Cycles (inclusive of 1T Cycles fee if creating a new canister)'),
                  SmallFormDivider(),
                  Text(
                      'Application subnets are in beta and therefore Cycles might be lost'),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
