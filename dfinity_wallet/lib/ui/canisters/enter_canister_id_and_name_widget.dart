import 'package:dfinity_wallet/ic_api/web/service_api.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../../dfinity.dart';

class EnterCanisterIdAndNameWidget extends StatelessWidget {
  final ValidatedTextField idField = ValidatedTextField("Canister ID",
      validations: [StringFieldValidation.minimumLength(10)], defaultText: "");
  final ValidatedTextField nameField = ValidatedTextField("Canister Name",
      validations: [StringFieldValidation.maximumLength(24)], defaultText: "");

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
                widthFactor: 1,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(6.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text("Canister Name",
                            style: Responsive.isDesktop(context) |
                                    Responsive.isTablet(context)
                                ? context.textTheme.headline3
                                : context.textTheme.headline4),
                        DebouncedValidatedFormField(nameField),
                        SmallFormDivider(),
                        Text("Canister ID",
                            style: Responsive.isDesktop(context) |
                                    Responsive.isTablet(context)
                                ? context.textTheme.headline3
                                : context.textTheme.headline4),
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
              width:
                  Responsive.isDesktop(context) | Responsive.isTablet(context)
                      ? 400
                      : 150,
              child: ValidFieldsSubmitButton(
                child: Text(
                  "Attach Canister",
                  style: Responsive.isDesktop(context) |
                          Responsive.isTablet(context)
                      ? TextStyle(fontSize: 25)
                      : TextStyle(fontSize: 14),
                ),
                onPressed: () async {
                  final result = await context.callUpdate(() => context.icApi
                      .attachCanister(
                          name: nameField.currentValue,
                          canisterId: idField.currentValue));
                  if (result == null) {
                    return;
                  }
                  switch (result) {
                    case AttachCanisterResult.Ok:
                      await context.icApi.getCanisters();
                      final canister =
                          context.boxes.canisters[idField.currentValue]!;
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
