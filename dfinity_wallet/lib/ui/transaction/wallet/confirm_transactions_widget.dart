import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';
import '../create_transaction_overlay.dart';

class ConfirmTransactionWidget extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return Container(
        child: Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            TransactionDetailsWidget(
              origin: origin,
              destination: destination,
              amount: amount,
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
                    if (origin.type == ICPSourceType.ACCOUNT) {
                      await context.performLoading(() => context.icApi
                          .sendICPTs(
                              toAccount: destination,
                              doms: amount.toE8s,
                              fromSubAccount: subAccountId));
                    } else if (origin.type == ICPSourceType.NEURON) {
                      await context.performLoading(() => context.icApi.disburse(
                          neuronId: BigInt.parse(origin.address),
                          doms: amount.toE8s,
                          toAccountId: destination));
                    } else if (origin.type == ICPSourceType.HARDWARE_WALLET) {}

                    WizardOverlay.of(context).replacePage(
                        "Transaction Completed!",
                        TransactionDoneWidget(
                          amount: amount,
                          origin: origin,
                          destination: destination,
                        ));
                  }),
            ),
            SmallFormDivider()
          ],
        ),
      ),
    ));
  }
}

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
                  final accountIdentifier = getAccountIdentifier(ledgerIdentity)!;

                  setState(() {
                    this.ledgerIdentity = ledgerIdentity;
                    connectionState = WalletConnectionState.CONNECTED;
                  });
                }),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Attach Wallet"),
                onPressed: (() async {
                  final accountIdentifier =
                      getAccountIdentifier(ledgerIdentity);
                  final account = context.boxes.accounts.hardwareWallets
                      .firstWhere((element) =>
                          element.accountIdentifier == accountIdentifier);

                  context.nav.push(AccountPageDef.createPageConfig(account));
                }).takeIf(
                    (e) => connectionState == WalletConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}
