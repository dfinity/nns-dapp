import 'package:dfinity_wallet/ic_api/web/service_api.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';
import 'new_canister_cycles_widget.dart';

class EnterCanisterIdAndNameWidget extends StatelessWidget {
  ValidatedTextField idField = ValidatedTextField("Canister ID",
      validations: [StringFieldValidation.minimumLength(10)],
      defaultText: "");
  ValidatedTextField nameField = ValidatedTextField("Canister Name",
      validations: [StringFieldValidation.maximumLength(24)],
      defaultText: "");

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
                        SmallFormDivider(),
                        Text("Canister ID", style: context.textTheme.headline3),
                        DebouncedValidatedFormField(idField),
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
                child: Text("Attach Canister"),
                onPressed: () async {
                  final result = await context.callUpdate(() =>
                      context.icApi.attachCanister(
                          name: nameField.currentValue,
                          canisterId: idField.currentValue));
                  if (result == null) {
                    return;
                  }
                  switch (result) {
                    case AttachCanisterResult.Ok:
                      await context.icApi.getCanisters();
                      final canister =
                          context.boxes.canisters.get(idField.currentValue)!;
                      context.nav
                          .push(CanisterPageDef.createPageConfig(canister));
                      break;
                    case AttachCanisterResult.CanisterAlreadyAttached:
                      showError(context, "Canister Already Attached");
                      break;
                    case AttachCanisterResult.NameAlreadyTaken:
                      showError(context, "Name Already Taken");
                      break;
                    case AttachCanisterResult.CanisterLimitExceeded:
                      showError(context, "Canister Limit Exceeded");
                      break;
                  }
                },
                fields: [nameField, idField],
              ))
        ],
      ),
    );
  }

  void showError(BuildContext context, String name) {
    OverlayBaseWidget.show(
        context,
        ConfirmDialog(
            title: "Failed to Attach Canister",
            description: name,
            onConfirm: () {}));
  }
}
