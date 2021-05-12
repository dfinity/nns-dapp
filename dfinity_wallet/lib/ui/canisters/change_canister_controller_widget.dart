import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';
import 'new_canister_cycles_widget.dart';


class ChangeCanisterControllerWidget extends StatelessWidget {

  final Canister canister;

  final ValidatedTextField controllerField = ValidatedTextField("New Canister Controller",
      validations: [StringFieldValidation.minimumLength(20)]);

  ChangeCanisterControllerWidget({Key? key, required this.canister}) : super(key: key);

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
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text("New Canister Controller",
                            style: context.textTheme.headline3),
                        DebouncedValidatedFormField(controllerField),
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
                child: Text("Perform Controller Change"),
                onPressed: () async {
                  confirmControllerChange(context);
                },
                fields: [controllerField],
              ))
        ],
      ),
    );
  }

  Future confirmControllerChange(BuildContext context) async {
    OverlayBaseWidget.show(
        context,
        ConfirmDialog(
          title: "Confirm Change Controller",
          description:
          "You are going to change the controller of canister ${canister.identifier}.\n\nAfter complete, the new controller will be ${controllerField.currentValue}",
          onConfirm: () async {
            await context.callUpdate(() => context.icApi.changeCanisterController(canister.identifier, controllerField.currentValue));
            OverlayBaseWidget.of(context)?.dismiss();
          },
        ));
  }
}
