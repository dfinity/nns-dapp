import 'package:flutter/material.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import '../../nns_dapp.dart';
import 'responsive.dart';

class MaxButton extends StatefulWidget {
  final ValidatedTextField amountField;
  final ICPSource source;

  const MaxButton({
    required this.amountField,
    required this.source,
  });

  @override
  _MaxButtonState createState() => _MaxButtonState();
}

class _MaxButtonState extends State<MaxButton> {
  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 30.0,
      right: 35.0,
      child: SizedBox(
        height: Responsive.isMobile(context) ? 30 : 40.0,
        width: Responsive.isMobile(context) ? 55 : 70.0,
        child: ElevatedButton(
          onPressed: () {
            if (widget.source.type == ICPSourceType.NEURON)
              widget.amountField.initialText = (widget.source.balance - ICP.one)
                  .asString(withSeparators: false);
            else
              widget.amountField.initialText = (widget.source.balance -
                      ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)))
                  .asString(withSeparators: false);
          }.takeIf((e) => (widget.source.balance != ICP.zero)),
          child: Padding(
            padding: const EdgeInsets.all(0.0),
            child: Text(
              'Max',
              style:
                  TextStyle(fontSize: Responsive.isMobile(context) ? 10 : 16),
            ),
          ),
        ),
      ),
    );
  }
}
