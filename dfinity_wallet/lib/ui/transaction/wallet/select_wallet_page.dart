
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/canister/topup_canister_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/send_to_wallet_page.dart';
import '../../../dfinity.dart';
import '../create_transaction_overlay.dart';
import 'new_wallet_page.dart';

class SelectDestinationWalletPage extends StatefulWidget {
  final ICPSource source;

  const SelectDestinationWalletPage({Key? key, required this.source}) : super(key: key);

  @override
  _SelectDestinationWalletPageState createState() => _SelectDestinationWalletPageState();
}

class _SelectDestinationWalletPageState extends State<SelectDestinationWalletPage> {
  final ValidatedTextField addressField = ValidatedTextField("Address",
      validations: [StringFieldValidation.minimumLength(40)]);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
            child: Text("Select a Wallet",
                style: context.textTheme.headline2.gray800),
          ),
          Expanded(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text("My Wallets:",
                      style: context.textTheme.headline3.gray800),
                ),
                Expanded(
                    child: EitherWidget(
                      condition: context.boxes.wallets.isNotEmpty,
                      trueWidget: ListView(
                        children: context.boxes.wallets.values.filter((element) => element != widget.source).mapToList(
                                (e) => _WalletRow(wallet: e, onPressed: () {
                              NewTransactionOverlay.of(context)
                                  .pushPage(SendToWalletPage(
                                source: widget.source,
                                toWallet: e,
                              ));
                            })),
                      ),
                      falseWidget: Align(
                        alignment: Alignment.topCenter,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            "No canisters registered on this device",
                            style: context.textTheme.bodyText2.gray800,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ))
              ],
            ),
          ),
          SizedBox(
            height: 100,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: DebouncedValidatedFormField(addressField),
                  ),
                  ValidFieldsSubmitButton(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text("Go"),
                    ),
                    fields: [addressField],
                    onPressed: () {
                      final address = addressField.currentValue;
                      NewTransactionOverlay.of(context)
                          .pushPage(TopUpCanisterPage(
                        source: widget.source,
                        canister: Canister(
                            address.characters.take(8).toString(), address),
                      ));
                    },
                  )
                ],
              ),
            ),
          ),
          Container(
            color: AppColors.gray100,
            width: double.infinity,
            height: 100,
            padding: EdgeInsets.all(20.0),
            child: ElevatedButton(
              child: Text("Create New Wallet"),
              onPressed: () {
                NewTransactionOverlay.of(context)
                    .pushPage(NewWalletPage(
                  source: widget.source,
                ));
              },
            ),
          )
        ],
      ),
    );
  }
}

class _WalletRow extends StatelessWidget {
  final Wallet wallet;
  final VoidCallback onPressed;
  final bool selected;

  const _WalletRow(
      {Key? key,
        required this.wallet,
        required this.onPressed,
        this.selected = false})
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
                        wallet.name,
                        style: context.textTheme.headline3
                            ?.copyWith(color: AppColors.gray800),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                          left: 16.0, bottom: 16.0, right: 16.0),
                      child: Text(
                        "Balance: ${wallet.balance}",
                        style: context.textTheme.bodyText1
                            ?.copyWith(color: AppColors.gray800),
                      ),
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
