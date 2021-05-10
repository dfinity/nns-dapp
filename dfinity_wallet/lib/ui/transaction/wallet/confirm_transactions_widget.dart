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
  final double fee;
  final double amount;
  final ICPSource source;
  final String destination;
  final int? subAccountId;

  const ConfirmTransactionWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.source,
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
              source: widget.source,
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
                    var isAccount = widget.source.type == ICPSourceType.ACCOUNT;
                    var isNeuronTransaction =
                        widget.source.type == ICPSourceType.NEURON;
                    var isHardwareTransactoin =
                        widget.source.type == ICPSourceType.HARDWARE_WALLET;
                    if (isAccount) {
                      await context.performLoading(() => context.icApi
                          .sendICPTs(
                              toAccount: widget.destination,
                              e8s: widget.amount.toE8s,
                              fromSubAccount: widget.subAccountId));
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            source: widget.source,
                            destination: widget.destination,
                          ));
                    } else if (isNeuronTransaction) {
                      // send the full balance of the neuron to the owner's accoun t
                      await context.performLoading(() async {
                        return context.icApi.disburse(
                            neuronId: BigInt.parse(widget.source.address),
                            // this is intentional. send all of them.
                            doms: widget.source.icpBalance.toE8s,
                            toAccountId: widget.destination);
                      });

                      // then automatically proceed to the completed screen
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            source: widget.source,
                            destination: widget.destination,
                          ));
                    } else if (isHardwareTransactoin) {
                      WizardOverlay.of(context).pushPage(
                          "Authorize on Hardware",
                          HardwareWalletTransactionWidget(
                            amount: widget.amount,
                            destination: widget.destination,
                            account: widget.source as Account,
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
      widget.source.type != ICPSourceType.HARDWARE_WALLET ||
      ledgerIdentity != null;
}
