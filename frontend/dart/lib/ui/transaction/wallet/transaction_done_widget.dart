import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/dfinity.dart';

class TransactionDoneWidget extends StatelessWidget {
  final ICP amount;
  final ICPSource source;
  final String destination;
  final PageConfig? followOnPage;

  const TransactionDoneWidget(
      {Key? key,
      required this.amount,
      required this.source,
      required this.destination,
      this.followOnPage})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: IntrinsicWidth(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  TransactionDetailsWidget(
                    source: source,
                    destination: destination,
                    amount: amount,
                  ),
                  SizedBox(
                    height: 70,
                    width: double.infinity,
                    child: ElevatedButton(
                      child: Text("Close"),
                      onPressed: () async {
                        if (this.followOnPage != null) {
                          context.nav.replace(this.followOnPage!);
                        } else {
                          OverlayBaseWidget.of(context)?.dismiss();
                        }
                      }
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
