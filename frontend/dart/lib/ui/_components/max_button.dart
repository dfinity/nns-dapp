import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:flutter/material.dart';

import '../../dfinity.dart';

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
    final myLocale = Localizations.localeOf(context);
    return Positioned(
      top: 30.0,
      right: 35.0,
      child: SizedBox(
        height: Responsive.isMobile(context) ? 30 : 40.0,
        width: Responsive.isMobile(context) ? 40 : 70.0,
        child: ElevatedButton(
          onPressed: () {
            widget.amountField.initialText = (widget.source.balance -
                    ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)))
                .asString(myLocale.languageCode);
          },
          child: Padding(
            padding: const EdgeInsets.all(0.0),
            child: Text(
              'Max',
              style:
                  TextStyle(fontSize: Responsive.isMobile(context) ? 12 : 16),
            ),
          ),
        ),
      ),
    );
  }
}
