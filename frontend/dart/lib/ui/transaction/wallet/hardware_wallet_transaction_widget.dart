import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:universal_html/js.dart' as js;
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';

class HardwareWalletTransactionWidget extends StatefulWidget {
  final ICP amount;
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: _TransactionDetailsWidget(
                      amount: widget.amount,
                      account: widget.account,
                      destination: widget.destination,
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        color: AppColors.mediumBackground,
                        borderRadius: BorderRadius.circular(10)),
                    child: HardwareConnectionWidget(
                        connectionState: connectionState,
                        ledgerIdentity: ledgerIdentity,
                        onConnectPressed: () async {
                          setState(() {
                            connectionState = WalletConnectionState.CONNECTING;
                          });
                          final res =
                              await context.icApi.connectToHardwareWallet();

                          res.when(ok: (ledgerIdentity) {
                            final accountIdentifier =
                                getAccountIdentifier(ledgerIdentity)!
                                    .toString();

                            if (widget.account.identifier ==
                                accountIdentifier) {
                              setState(() {
                                this.ledgerIdentity = ledgerIdentity;
                                connectionState =
                                    WalletConnectionState.CONNECTED;
                              });
                            } else {
                              setState(() {
                                this.ledgerIdentity = ledgerIdentity;
                                connectionState =
                                    WalletConnectionState.INCORRECT_DEVICE;
                              });
                            }
                          }, err: (err) {
                            setState(() {
                              // Display the error.
                              js.context.callMethod("alert", ["$err"]);
                              connectionState =
                                  WalletConnectionState.NOT_CONNECTED;
                            });
                          });
                        }),
                  ),
                  TallFormDivider(),
                ],
              ),
            ),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Confirm Transaction"),
                onPressed: (() async {
                  final res = await context.callUpdate(() => context.icApi
                      .sendICP(
                          fromAccount: widget.account.identifier,
                          toAccount: widget.destination,
                          amount: widget.amount));

                  res.when(ok: (unit) {
                    WizardOverlay.of(context).replacePage(
                        "Transaction Completed!",
                        TransactionDoneWidget(
                          amount: widget.amount,
                          source: widget.account,
                          destination: widget.destination,
                        ));
                      }, err: (err) {
                    // An error occurred during transfer. Display the error.
                    js.context.callMethod("alert", ["$err"]);
                  });
                }).takeIf(
                    (e) => connectionState == WalletConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}

class _TransactionDetailsWidget extends StatelessWidget {
  final ICP amount;
  final Account account;
  final String destination;

  const _TransactionDetailsWidget(
      {Key? key,
      required this.amount,
      required this.account,
      required this.destination})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Transaction Details", style: context.textTheme.headline3),
        TallFormDivider(),
        Text("Source", style: context.textTheme.headline4),
        VerySmallFormDivider(),
        Text(account.address, style: context.textTheme.bodyText1),
        SmallFormDivider(),
        Text("Destination", style: context.textTheme.headline4),
        VerySmallFormDivider(),
        Text(destination, style: context.textTheme.bodyText1),
        SmallFormDivider(),
        Text("Amount", style: context.textTheme.headline4),
        VerySmallFormDivider(),
        Text(amount.asString(), style: context.textTheme.bodyText1),
        VerySmallFormDivider(),
      ],
    );
  }
}
