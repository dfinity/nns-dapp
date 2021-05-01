import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';

import '../../dfinity.dart';
import 'cycle_calculator.dart';
import 'new_canister_cycles_widget.dart';



class EnterCanisterIdAndNameWidget extends StatelessWidget {
  ValidatedTextField idField = ValidatedTextField("Canister ID",
      validations: [StringFieldValidation.minimumLength(60)]);
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
                        SmallFormDivider(),
                        Text("Canister ID",
                            style: context.textTheme.headline3),
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
                  final canister = Canister.demo(nameField.currentValue, idField.currentValue);
                  canister.cyclesAdded = CycleCalculator.icpToCycles(random.nextInt(1000).toDouble()).toInt();
                  await context.icApi.hiveBoxes.canisters.put(idField.currentValue, canister);
                  await context.performLoading(() => 2.seconds.delay);
                  context.nav.push(CanisterPageDef.createPageConfig(canister));
                },
                fields: [nameField, idField],
              ))
        ],
      ),
    );
  }
}
