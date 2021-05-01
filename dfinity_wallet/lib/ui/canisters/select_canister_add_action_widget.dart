
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/cansiter_name_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';

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
              buildButton(context, "Attach Existing Canister", "Enter the id of a canister, to top up it's cycles", () {
                WizardOverlay.of(context).pushPage("Attach Canister", EnterCanisterIdAndNameWidget());
              }),
              SmallFormDivider(),
              buildButton(context, "Create New Canister", "Create a new canister, to deploy your application", () {
                WizardOverlay.of(context).pushPage("Enter Canister Name", CanisterNameWidget());
              }),
              SmallFormDivider(),
              SizedBox(height: 50,)
            ],
          ),
        ),
      ),
    );
  }

  TextButton buildButton(BuildContext context, String title, String subtitle, Function() onPressed) {
    return TextButton(
      style: ButtonStyle(
          shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))),
          overlayColor: MaterialStateProperty.resolveWith((states) {
            return AppColors.blue600.withOpacity(0.5);
          })
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: SizedBox(
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: context.textTheme.headline3,
              ),
              SizedBox(height: 10,),
              Text(
                subtitle,
                style: context.textTheme.subtitle2?.copyWith(color: AppColors.gray200),
              ),
            ],
          ),
        ),
      ),
      onPressed: onPressed,
    );
  }
}