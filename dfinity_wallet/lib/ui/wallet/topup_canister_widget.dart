import 'package:dfinity_wallet/data/app_state.dart';
import 'package:dfinity_wallet/data/canister.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../../dfinity.dart';

class TopUpCanisterWidget extends StatefulWidget {
  final Wallet wallet;

  const TopUpCanisterWidget({Key? key, required this.wallet}) : super(key: key);

  @override
  _TopUpCanisterWidgetState createState() => _TopUpCanisterWidgetState();
}

class _TopUpCanisterWidgetState extends State<TopUpCanisterWidget> {
  Canister? selectedCanister;
  late ValidatedField amountField;

  @override
  void initState() {
    super.initState();
    amountField = ValidatedField(
        "Amount", [FieldValidation("Not enough ICP in wallet", (e) => (e.toIntOrNull() ?? 0) > widget.wallet.balance)],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Card(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
                child: Text("Top up Canister", style: context.textTheme.headline2?.copyWith(color: AppColors.gray1000)),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child:
                    Text("Select Canister:", style: context.textTheme.headline3?.copyWith(color: AppColors.gray1000)),
              ),
              if (AppState.shared.canisters.isEmpty)
                Center(
                  child: Column(
                    children: [
                      Text("No canisters!\n\n Go to the canisters tab on the home screen to create one"),
                    ],
                  ),
                ),
              Expanded(
                  child: Column(
                children: AppState.shared.canisters.mapToList((e) => _CanisterRow(
                      canister: e,
                      selected: selectedCanister == e,
                      onPressed: () {
                        setState(() {
                          if (selectedCanister == e) {
                            selectedCanister = null;
                          } else {
                            selectedCanister = e;
                          }
                        });
                      },
                    )),
              )),
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
                          onPressed: () {
                            context.navigator.pop();
                            final amount = amountField.text.toDouble();
                            final cyclesBought = (amount * 50).round();
                            selectedCanister!.cyclesAdded += cyclesBought;
                            widget.wallet.transactions.add(Transaction(
                                amount: amount, fromKey: widget.wallet.publicKey, toKey: selectedCanister!.publicKey));
                            showDialog(
                                context: context,
                                builder: (context) =>
                                    DoneWidget(numCycles: cyclesBought, canisterName: selectedCanister!.name));
                          }.takeIf((e) => selectedCanister != null),
                          fields: [amountField],
                        ))
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _CanisterRow extends StatelessWidget {
  final Canister canister;
  final VoidCallback onPressed;
  final bool selected;

  const _CanisterRow({Key? key, required this.canister, required this.onPressed, this.selected = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        canister.name,
                        style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
                      child: Text(
                        "Balance: ${canister.cyclesRemaining}",
                        style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                      ),
                    )
                  ],
                ),
              ),
              Padding(
                  padding: EdgeInsets.all(16),
                  child: Container(
                    padding: EdgeInsets.all(8),
                    decoration: ShapeDecoration(
                      color: fillColorForOption(),
                      shape: CircleBorder(side: BorderSide(color: colorForOption(), width: 2)),
                    ),
                  ))
            ],
          ),
        ),
      ),
    );
  }

  Color colorForOption() {
    return selected ? AppColors.blue200 : AppColors.gray600;
  }

  Color fillColorForOption() {
    return selected ? AppColors.blue600 : AppColors.white;
  }
}

class DoneWidget extends StatelessWidget {
  final int numCycles;
  final String canisterName;

  const DoneWidget({Key? key, required this.numCycles, required this.canisterName}) : super(key: key);

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
                child: Text("Transaction Completed", style: context.textTheme.headline2?.copyWith(color: AppColors.gray1000),),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text("${numCycles} Cycles sent to $canisterName", style: context.textTheme.headline3?.copyWith(color: AppColors.gray1000)),
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
                          context.navigator.pop();
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
