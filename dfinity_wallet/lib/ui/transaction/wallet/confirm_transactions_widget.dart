import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:dfinity_wallet/ic_api/web/web_ic_api.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';
import '../wizard_overlay.dart';
import 'hardware_wallet_transaction_widget.dart';

class ConfirmTransactionWidget extends StatefulWidget {
  final double amount;
  final ICPSource origin;
  final String destination;
  final int? subAccountId;

  const ConfirmTransactionWidget(
      {Key? key,
      required this.amount,
      required this.origin,
      required this.destination,
      required this.subAccountId})
      : super(key: key);

  @override
  _ConfirmTransactionWidgetState createState() =>
      _ConfirmTransactionWidgetState();
}

class _ConfirmTransactionWidgetState extends State<ConfirmTransactionWidget> {
  WalletConnectionState connectionState = WalletConnectionState.NOT_CONNECTED;
  dynamic ledgerIdentity;

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            TransactionDetailsWidget(
              origin: widget.origin,
              destination: widget.destination,
              amount: widget.amount,
            ),
            Expanded(child: Container()),
            SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text("Confirm and Send"),
                  ),
                  onPressed: () async {
                    if (widget.origin.type == ICPSourceType.ACCOUNT) {
                      await context.performLoading(() => context.icApi
                          .sendICPTs(
                              toAccount: widget.destination,
                              doms: widget.amount.toE8s,
                              fromSubAccount: widget.subAccountId));
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            origin: widget.origin,
                            destination: widget.destination,
                          ));
                    } else if (widget.origin.type == ICPSourceType.NEURON) {
                      await context.performLoading(() async {
                        return context.icApi.disburse(
                            neuronId: BigInt.parse(widget.origin.address),
                            doms: widget.amount.toE8s,
                            toAccountId: widget.destination);
                      });
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            origin: widget.origin,
                            destination: widget.destination,
                          ));
                    } else if (widget.origin.type ==
                        ICPSourceType.HARDWARE_WALLET) {
                      WizardOverlay.of(context).pushPage(
                          "Authorize on Hardware",
                          HardwareWalletTransactionWidget(
                            amount: widget.amount,
                            destination: widget.destination,
                            account: widget.origin as Account,
                          ));
                    }
                  }),
            ),
            SmallFormDivider()
          ],
        ),
      ),
    ));
  }

  bool canConfirm() =>
      widget.origin.type != ICPSourceType.HARDWARE_WALLET ||
      ledgerIdentity != null;
}
