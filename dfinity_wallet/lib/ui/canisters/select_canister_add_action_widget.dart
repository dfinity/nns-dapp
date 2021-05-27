import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/cansiter_name_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
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
        child: Column(
          //crossAxisAlignment: CrossAxisAlignment.start,
          //mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            WizardPathButton(
                title: "Create New Canister",
                subtitle: "Create a new canister, to deploy your application",
                onPressed: () {
                  WizardOverlay.of(context)
                      .pushPage("Enter Canister Name", CanisterNameWidget());
                }),
            // SmallFormDivider(),
            Divider(
              height: 3.0,
              color: Colors.white,
            ),
            WizardPathButton(
                title: "Link Canister To Account",
                subtitle: "Enter the id of a canister, to top up it's cycles",
                onPressed: () {
                  WizardOverlay.of(context).pushPage(
                      "Attach Canister", EnterCanisterIdAndNameWidget());
                }),
            // SmallFormDivider(),
            // SizedBox(
            //   height: 50,
            // )
          ],
        ),
      ),
    );
  }
}
