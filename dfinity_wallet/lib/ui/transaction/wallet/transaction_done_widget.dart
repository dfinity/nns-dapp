import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/dfinity.dart';

class TransactionDoneWidget extends StatelessWidget {
  final double amount;
  final ICPSource source;
  final String destination;

  const TransactionDoneWidget(
      {Key? key,
      required this.amount,
      required this.source,
      required this.destination})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Center(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: IntrinsicWidth(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              TransactionDetailsWidget(
                source: source,
                destination: destination,
                amount: amount,
              ),
              Expanded(child: Container(),),
              SizedBox(
                height: 70,
                width: double.infinity,
                child: ElevatedButton(
                    child: Text("Close"),
                    onPressed: () async {
                      OverlayBaseWidget.of(context)?.dismiss();
                    }),
              )
            ],
          ),
        ),
      ),
    ));
  }
}
