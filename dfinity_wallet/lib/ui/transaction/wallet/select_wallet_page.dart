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

  const SelectDestinationWalletPage({Key? key, required this.source})
      : super(key: key);

  @override
  _SelectDestinationWalletPageState createState() =>
      _SelectDestinationWalletPageState();
}

class _SelectDestinationWalletPageState
    extends State<SelectDestinationWalletPage> {
  final ValidatedTextField addressField = ValidatedTextField("Specific Address",
      validations: [StringFieldValidation.minimumLength(40)]);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16.0),
            color: AppColors.lighterBackground,
            child: Row(
              children: [
                Expanded(
                  child: DebouncedValidatedFormField(addressField),
                ),
                SizedBox(
                  width: 10,
                ),
                ValidFieldsSubmitButton(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Text("Send"),
                  ),
                  fields: [addressField],
                  onPressed: () {
                    final address = addressField.currentValue;
                    NewTransactionOverlay.of(context).pushPage(SendToWalletPage(
                      source: widget.source,
                      toWallet: Wallet(address.characters.take(8).toString(),
                          address, false, "0", "", []),
                    ));
                  },
                )
              ],
            ),
          ),
          SizedBox(
            height: 3,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20.0),
                    child: Text("My Accounts", style: context.textTheme.bodyText1,),
                  ),
                  ...context.boxes.wallets.values
                    .filter((element) => element != widget.source)
                    .mapToList((e) => _WalletRow(
                        wallet: e,
                        onPressed: () {
                          NewTransactionOverlay.of(context)
                              .pushPage(SendToWalletPage(
                            source: widget.source,
                            toWallet: e,
                          ));
                        }))
                ]),
            ),
          ),

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
      color: AppColors.lightBackground,
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
                        style: context.textTheme.headline3,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                          left: 16.0, bottom: 16.0, right: 16.0),
                      child: Text(
                        "Balance: ${wallet.icpBalance}",
                        style: context.textTheme.bodyText1,
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
