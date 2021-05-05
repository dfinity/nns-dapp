import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/cansiter_name_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_path_button.dart';

import '../../dfinity.dart';
import 'enter_canister_id_and_name_widget.dart';

class SelectCanisterAddActionWidget extends StatelessWidget {
  const SelectCanisterAddActionWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Center(
        child: IntrinsicWidth(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              WizardPathButton(title: "Attach Existing Canister",
                  subtitle: "Enter the id of a canister, to top up it's cycles", onPressed:() {
                WizardOverlay.of(context).pushPage(
                    "Attach Canister", EnterCanisterIdAndNameWidget());
              }),
              SmallFormDivider(),
              WizardPathButton(title: "Create New Canister",
                  subtitle: "Create a new canister, to deploy your application", onPressed:() {
                WizardOverlay.of(context)
                    .pushPage("Enter Canister Name", CanisterNameWidget());
              }),
              SmallFormDivider(),
              SizedBox(
                height: 50,
              )
            ],
          ),
        ),
      ),
    );
  }
}
