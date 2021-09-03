import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';
import 'package:universal_html/js.dart' as js;

import '../../../dfinity.dart';
import '../wizard_overlay.dart';
import 'hardware_wallet_transaction_widget.dart';

class ConfirmTransactionWidget extends StatefulWidget {
  final ICP fee;
  final ICP amount;
  final ICPSource source;
  final String destination;

  const ConfirmTransactionWidget({
    Key? key,
    required this.fee,
    required this.amount,
    required this.source,
    required this.destination,
  }) : super(key: key);

  @override
  _ConfirmTransactionWidgetState createState() =>
      _ConfirmTransactionWidgetState();
}

class _ConfirmTransactionWidgetState extends State<ConfirmTransactionWidget> {
  WalletConnectionState connectionState = WalletConnectionState.NOT_CONNECTED;
  dynamic ledgerIdentity;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
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
              // Expanded(child: Container()),
              SmallFormDivider(),
              SizedBox(
                height: 70,
                width: double.infinity,
                child: ElevatedButton(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        "Confirm and Send",
                        style: TextStyle(
                            fontSize: Responsive.isTablet(context) |
                                    Responsive.isDesktop(context)
                                ? kTextSizeLarge
                                : kTextSizeSmall),
                      ),
                    ),
                    onPressed: () async {
                      switch (widget.source.type) {
                        case ICPSourceType.ACCOUNT:
                          final res = await context.callUpdate(() =>
                              context.icApi.sendICP(
                                  fromAccount: widget.source.address,
                                  toAccount: widget.destination,
                                  amount: widget.amount,
                                  fromSubAccount: widget.source.subAccountId));

                          res.when(ok: (unit) {
                            WizardOverlay.of(context).replacePage(
                                "Transaction Completed!",
                                TransactionDoneWidget(
                                  amount: widget.amount,
                                  source: widget.source,
                                  destination: widget.destination,
                                ));
                          }, err: (err) {
                            // Send ICP failed. Display the error.
                            js.context.callMethod("alert", ["$err"]);
                          });
                          break;
                        case ICPSourceType.NEURON:
                          // send the full balance of the neuron to the owner's account
                          final res = await context.callUpdate(() async {
                            return context.icApi.disburse(
                                neuron: widget.source as Neuron,
                                // this is intentional. send all of them.
                                amount: widget.source.balance,
                                toAccountId: widget.destination);
                          });

                          res.when(ok: (unit) {
                            // Disburse succeeded. Proceed to next screen.
                            WizardOverlay.of(context).replacePage(
                                "Transaction Completed!",
                                TransactionDoneWidget(
                                  amount: widget.amount,
                                  source: widget.source,
                                  destination: widget.destination,
                                ));
                          }, err: (err) {
                            // Disburse failed. Display the error.
                            js.context.callMethod("alert", ["$err"]);
                          });
                          break;
                        case ICPSourceType.HARDWARE_WALLET:
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
      )),
    );
  }

  bool canConfirm() =>
      widget.source.type != ICPSourceType.HARDWARE_WALLET ||
      ledgerIdentity != null;
}
