import 'dart:js_util';

import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:dfinity_wallet/ic_api/web/web_ic_api.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';
import '../create_transaction_overlay.dart';
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
  _ConfirmTransactionWidgetState createState() => _ConfirmTransactionWidgetState();
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
            if(widget.origin.type == ICPSourceType.HARDWARE_WALLET)
              HardwareConnectionWidget(
                  connectionState: connectionState,
                  ledgerIdentity: ledgerIdentity,
                  onConnectPressed: () async {
                    setState(() {
                      connectionState = WalletConnectionState.CONNECTING;
                    });
                    final ledgerIdentity =
                    await context.icApi.connectToHardwareWallet();
                    final json = stringify(ledgerIdentity);
                    print("identity ${json}");
                    final accountIdentifier =
                    getAccountIdentifier(ledgerIdentity)!.toString();

                    if (widget.origin.address == accountIdentifier) {
                      setState(() {
                        this.ledgerIdentity = ledgerIdentity;
                        connectionState = WalletConnectionState.CONNECTED;
                      });
                    } else {
                      setState(() {
                        this.ledgerIdentity = ledgerIdentity;
                        connectionState = WalletConnectionState.INCORRECT_DEVICE;
                      });
                    }
                  }),
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
                      await context.performLoading(() => context.icApi.disburse(
                          neuronId: BigInt.parse(widget.origin.address),
                          doms: widget.amount.toE8s,
                          toAccountId: widget.destination));
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            origin: widget.origin,
                            destination: widget.destination,
                          ));
                    } else if (widget.origin.type == ICPSourceType.HARDWARE_WALLET) {}

                    final walletApi = await context.icApi
                        .createHardwareWalletApi(ledgerIdentity: ledgerIdentity);

                    final response = await
                        promiseToFuture(walletApi.sendICPTs(
                            widget.origin.address,
                            SendICPTsRequest(
                                to: widget.destination,
                                amount: widget.amount.toE8s.toJS)));

                    if(response!= null){
                      WizardOverlay.of(context).replacePage(
                          "Transaction Completed!",
                          TransactionDoneWidget(
                            amount: widget.amount,
                            origin: widget.origin,
                            destination: widget.destination,
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

  bool canConfirm() => widget.origin.type != ICPSourceType.HARDWARE_WALLET || ledgerIdentity != null;
}

