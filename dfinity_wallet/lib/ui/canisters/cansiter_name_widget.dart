import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

import '../../dfinity.dart';
import 'new_canister_cycles_widget.dart';



class CanisterNameWidget extends StatelessWidget {
  ValidatedTextField nameField = ValidatedTextField("Canister Name",
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
                        Text("Canister Name",
                            style: context.textTheme.headline3),
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
                child: Text("Confirm Name"),
                onPressed: () async {
                  WizardOverlay.of(context).pushPage(
                      "Select ICP Origin",
                      SelectCyclesOriginWidget(onSelected: (account, context) {
                    WizardOverlay.of(context).pushPage(
                        "Enter Amount",
                        NewCanisterCyclesAmountWidget(
                          origin: account,
                          name: nameField.currentValue,
                        ));
                  }));
                },
                fields: [nameField],
              ))
        ],
      ),
    );
  }
}
