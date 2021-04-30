
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'attach_hardware_wallet.dart';

class HardwareWalletNameWidget extends StatelessWidget {

  ValidatedTextField nameField = ValidatedTextField("Hardware Wallet Name",
      validations: [StringFieldValidation.minimumLength(2)]);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Align(
              alignment: Alignment(0, -0.5),
              child: FractionallySizedBox(
                widthFactor: 0.7,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(6.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text("Name", style: context.textTheme.headline3),
                        DebouncedValidatedFormField(nameField),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text("Connect to Wallet"),
                onPressed: () async {
                  NewTransactionOverlay.of(context).pushPage("Connect to Wallet", AttachHardwareWalletWidget(name: nameField.name));
                },
                fields: [nameField],
              ))
        ],
      ),
    );
  }
}