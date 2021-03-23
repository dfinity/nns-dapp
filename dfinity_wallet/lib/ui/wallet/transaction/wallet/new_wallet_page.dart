
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/debounced_validated_form_field.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/canister/topup_canister_page.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/wallet/send_to_wallet_page.dart';
import 'package:uuid/uuid.dart';

import '../../../../dfinity.dart';
import '../create_transaction_overlay.dart';

class NewWalletPage extends StatelessWidget {

  final ICPSource source;
  NewWalletPage({Key? key, required this.source}) : super(key: key);

  final ValidatedTextField nameField = ValidatedTextField("Canister Name", validations: [StringFieldValidation.minimumLength(2)]);

  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
            child: Text("New Wallet",
                style: context.textTheme.headline2.gray800),
          ),
          SizedBox(
              height: 100,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: DebouncedValidatedFormField(nameField),
              )
          ),
          Expanded(child: Container()),
          Container(
            color: AppColors.gray100,
            width: double.infinity,
            height: 100,
            padding: EdgeInsets.all(20.0),
            child: ValidFieldsSubmitButton(
              child: Text("Create Wallet"),
              fields: [nameField],
              onPressed: () {
                final wallet = Wallet(nameField.currentValue, Uuid().v4());
                context.boxes.wallets.add(wallet);
                NewTransactionOverlay.of(context)
                    .pushPage(SendToWalletPage(
                    source: source, toWallet: wallet,
                ));
              },
            ),
          )
        ],
      ),
    );
  }
}
