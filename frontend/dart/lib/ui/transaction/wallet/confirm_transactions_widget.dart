import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_details_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/transaction_done_widget.dart';
import 'package:dfinity_wallet/ui/wallet/hardware_wallet_connection_widget.dart';

import '../../../dfinity.dart';
import '../wizard_overlay.dart';
import 'hardware_wallet_transaction_widget.dart';

class ConfirmTransactionWidget extends StatefulWidget {
  final ICP fee;
  final ICP amount;
  final ICPSource source;
  final String destination;
  final int? subAccountId;
  final bool isTopUpNeuron;

  const ConfirmTransactionWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.source,
      required this.destination,
      required this.subAccountId,
      required this.isTopUpNeuron})
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
                      var isAccount =
                          widget.source.type == ICPSourceType.ACCOUNT;
                      var isNeuronTransaction =
                          widget.source.type == ICPSourceType.NEURON;
                      var isHardwareTransaction =
                          widget.source.type == ICPSourceType.HARDWARE_WALLET;
                      if (widget.isTopUpNeuron) {
                        await context.callUpdate(() => context.icApi.topUpNeuron(
                            neuronAccountIdentifier: widget.destination,
                            amount: widget.amount,
                            fromSubAccount: widget.subAccountId));
                        WizardOverlay.of(context).replacePage(
                            "Transaction Completed!",
                            TransactionDoneWidget(
                              amount: widget.amount,
                              source: widget.source,
                              destination: widget.destination,
                            ));
                      } else if (isAccount) {
                        await context.callUpdate(() => context.icApi.sendICPTs(
                            toAccount: widget.destination,
                            amount: widget.amount,
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
                        await context.callUpdate(() async {
                          return context.icApi.disburse(
                              neuron: widget.source as Neuron,
                              // this is intentional. send all of them.
                              amount: widget.source.balance,
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
                      } else if (isHardwareTransaction) {
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
