import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/canister/topup_canister_page.dart';
import 'package:uuid/uuid.dart';

import '../../../../dfinity.dart';
import '../create_transaction_overlay.dart';

class NewCanisterPage extends StatelessWidget {

  final Wallet wallet;
  NewCanisterPage({Key? key, required this.wallet}) : super(key: key);

  final ValidatedTextField nameField = ValidatedTextField("Canister Name", validations: [StringFieldValidation.minimumLength(2)]);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
            child: Text("New Canister",
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
              child: Text("Create Canister"),
              fields: [nameField],
              onPressed: () {
                final canister = Canister(nameField.currentValue, Uuid().v4());
                context.boxes.canisters.add(canister);
                NewTransactionOverlay.of(context)
                    .pushPage(TopUpCanisterPage(
                  wallet: wallet, canister: canister
                ));
              },
            ),
          )
        ],
      ),
    );
  }
}
