import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';

import '../../dfinity.dart';
import 'new_canister_cycles_widget.dart';

class CanisterNameWidget extends StatelessWidget {
  final ValidatedTextField nameField = ValidatedTextField("Canister Name",
      validations: [StringFieldValidation.boundLength(2, 24)]);

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
                  "Confirm Name",
                  style: Responsive.isDesktop(context) |
                          Responsive.isTablet(context)
                      ? TextStyle(fontSize: 25)
                      : TextStyle(fontSize: 14),
                ),
                onPressed: () async {
                  WizardOverlay.of(context).pushPage("Select ICP Source",
                      SelectCyclesOriginWidget(onSelected: (account, context) {
                    WizardOverlay.of(context).pushPage(
                        "Enter Amount",
                        NewCanisterCyclesAmountWidget(
                          source: account,
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
