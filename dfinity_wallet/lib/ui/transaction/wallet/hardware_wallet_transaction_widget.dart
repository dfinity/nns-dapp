import 'dart:js_util';

import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:dfinity_wallet/ic_api/web/web_ic_api.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';

class HardwareWalletTransactionWidget extends StatefulWidget {
  final double amount;
  final Account account;
  final String destination;

  const HardwareWalletTransactionWidget(
      {Key? key,
      required this.amount,
      required this.account,
      required this.destination})
      : super(key: key);

  @override
  _HardwareWalletTransactionWidgetState createState() =>
      _HardwareWalletTransactionWidgetState();
}

class _HardwareWalletTransactionWidgetState
    extends State<HardwareWalletTransactionWidget> {
  WalletConnectionState connectionState = WalletConnectionState.NOT_CONNECTED;
  dynamic ledgerIdentity;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: HardwareConnectionWidget(
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

                  if (widget.account.identifier == accountIdentifier) {
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
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Confirm Transaction"),
                onPressed: (() async {
                  final walletApi = await context.icApi
                      .createHardwareWalletApi(ledgerIdentity: ledgerIdentity);

                  final response = await context.performLoading(() =>
                      promiseToFuture(walletApi.sendICPTs(
                          widget.account.accountIdentifier,
                          SendICPTsRequest(
                              to: widget.destination,
                              amount: widget.amount.toE8s.toJS))));

                  if(response!= null){
                    WizardOverlay.of(context).replacePage(
                        "Transaction Completed!",
                        TransactionDoneWidget(
                          amount: widget.amount,
                          origin: widget.account,
                          destination: widget.destination,
                        ));
                  }
                }).takeIf(
                    (e) => connectionState == WalletConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}
