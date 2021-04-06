import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../create_transaction_overlay.dart';

class SendToWalletPage extends StatefulWidget {
  final ICPSource source;
  final Wallet toWallet;

  const SendToWalletPage(
      {Key? key, required this.source, required this.toWallet})
      : super(key: key);

  @override
  _SendToWalletPageState createState() => _SendToWalletPageState();
}

class _SendToWalletPageState extends State<SendToWalletPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();

    amountField = ValidatedTextField("Amount",
        validations: [
          FieldValidation("Not enough ICP in account",
              (e) => (e.toIntOrNull() ?? 0) > widget.source.icpBalance)
        ],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          children: [
            Padding(
              padding:
                  const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
              child:
                  Text("Send to account", style: context.textTheme.headline2),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(widget.toWallet.address,
                  style: context.textTheme.bodyText2),
            ),
            Expanded(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(8),
                  child: DebouncedValidatedFormField(amountField),
                ),
              ),
            ),
            SizedBox(
                height: 70,
                width: double.infinity,
                child: ValidFieldsSubmitButton(
                  child: Text("Send"),
                  onPressed: () async {
                    final amount = amountField.currentValue.toDouble();
                    await context.performLoading(() {
                      return context.icApi
                          .sendICPTs(toAccount: widget.toWallet.address, doms: amount.toDoms, fromSubAccount: widget.source.subAccountId);
                    });
                    NewTransactionOverlay.of(context).pushPage(null, DoneWidget(
                        numICP: amount, canisterName: widget.toWallet.name));
                  },
                  fields: [amountField],
                ))
          ],
        ),
      ),
    );
  }
}

class DoneWidget extends StatelessWidget {
  final double numICP;
  final String canisterName;

  const DoneWidget({Key? key, required this.numICP, required this.canisterName})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.all(32.0),
              child: Text("Transaction Completed",
                  style: context.textTheme.headline2),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text("${numICP} ICP sent to $canisterName",
                  style: context.textTheme.headline3),
            ),
            Expanded(child: Container()),
            Padding(
              padding: const EdgeInsets.all(26.0),
              child: SizedBox(
                height: 100,
                width: double.infinity,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ElevatedButton(
                      onPressed: () {
                        context.nav.push(AccountsTabPage);
                      },
                      child: Text("OK")),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
