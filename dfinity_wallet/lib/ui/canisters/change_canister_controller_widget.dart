import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../../dfinity.dart';

class ChangeCanisterControllerWidget extends StatelessWidget {
  final Canister canister;

  final ValidatedTextField controllerField = ValidatedTextField("",
      validations: [StringFieldValidation.minimumLength(0)]);

  ChangeCanisterControllerWidget({Key? key, required this.canister})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    controllerField.initialText = canister.controllers?.join(",") ?? "";
    return Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          Text("Update Controllers", style: context.textTheme.headline3),
          Text(
              "\nSpecify the new controller(s) of the canister. Multiple controllers can be specified by separating them with commas (e.g. \"controller_1,controller_2\")."),
          DebouncedValidatedFormField(controllerField),
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
        ]));
  }

  Future confirmControllerChange(BuildContext context) async {
    final newControllers = controllerField.currentValue
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e != "")
        .toList();

    OverlayBaseWidget.show(
        context,
        ConfirmDialog(
          title: "Confirm Change of Controllers",
          description: newControllers.isNotEmpty
              ? "The controllers of canister ${canister.identifier} will be updated to the following:\n\n${newControllers.join("\n")}\n\nAre you sure?"
              : "WARNING: All controllers of canister ${canister.identifier} will be removed. Are you sure?",
          onConfirm: () async {
            try {
              await context.callUpdate(() => context.icApi
                  .changeCanisterControllers(
                      canister.identifier, newControllers));
            } catch (err) {
              // TODO(NU-71): Display error message in case of failure.
            }
            OverlayBaseWidget.of(context)?.dismiss();
          },
        ));
  }
}
