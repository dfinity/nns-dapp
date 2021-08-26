import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:flutter/services.dart';

import '../../../dfinity.dart';

class TopUpCanisterPage extends StatefulWidget {
  final ICPSource source;
  final Canister canister;

  const TopUpCanisterPage(
      {Key? key, required this.source, required this.canister})
      : super(key: key);

  @override
  _TopUpCanisterPageState createState() => _TopUpCanisterPageState();
}

class _TopUpCanisterPageState extends State<TopUpCanisterPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    super.initState();
    amountField = ValidatedTextField("Amount",
        validations: [
          StringFieldValidation.insufficientFunds(widget.source.balance, 2)
        ],
        inputType: TextInputType.number,
        inputFormatters: <TextInputFormatter>[ICPTextInputFormatter()]);
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
              child: Text("Top up Canister",
                  style: context.textTheme.headline2.gray800),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(widget.canister.publicKey,
                  style: context.textTheme.bodyText2.gray800),
            ),
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Column(
                children: [
                  Expanded(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
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
                          await context.callUpdate(() => context.icApi
                              .topUpCanister(
                                  amount:
                                      ICP.fromString(amountField.currentValue),
                                  canisterId: widget.canister.identifier,
                                  fromSubAccountId:
                                      widget.source.subAccountId));

                          // WizardOverlay.of(context).pushPage(null, DoneWidget(numCycles: amountField.currentValue, canisterName: widget.canister.name));
                        },
                        fields: [amountField],
                      ))
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

class DoneWidget extends StatelessWidget {
  final int numCycles;
  final String canisterName;

  const DoneWidget(
      {Key? key, required this.numCycles, required this.canisterName})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        child: Center(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Padding(
                padding: const EdgeInsets.all(32.0),
                child: Text(
                  "Transaction Completed",
                  style: context.textTheme.headline2
                      ?.copyWith(color: AppColors.gray1000),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text("${numCycles} Cycles sent to $canisterName",
                    style: context.textTheme.headline3
                        ?.copyWith(color: AppColors.gray1000)),
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
                          context.nav.push(canistersTabPage);
                        },
                        child: Text("OK")),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
