import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';
import 'package:nns_dapp/ui/transaction/wizard_overlay.dart';

import '../../nns_dapp.dart';
import 'attach_hardware_wallet.dart';

class HardwareWalletNameWidget extends StatelessWidget {
  final ValidatedTextField nameField = ValidatedTextField(
      "Hardware Wallet Name",
      validations: [StringFieldValidation.minimumLength(2)]);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Align(
              alignment: Alignment(0, -0.5),
              child: FractionallySizedBox(
                widthFactor: 1,
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
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: SizedBox(
              height: 70,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text(
                  "Connect to Wallet",
                ),
                onPressed: () async {
                  WizardOverlay.of(context).pushPage("Connect to Wallet",
                      AttachHardwareWalletWidget(name: nameField.currentValue));
                },
                fields: [nameField],
              )),
        )
      ],
    );
  }
}
