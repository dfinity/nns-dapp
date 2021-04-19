
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';

import '../../dfinity.dart';
import 'create_transaction_overlay.dart';

class SelectAccountTransactionTypeWidget extends StatelessWidget {
  final ICPSource source;

  const SelectAccountTransactionTypeWidget({
    Key? key,
    required this.source,
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
              buildButton(context, "Send", "Send ICP to another account", () {
                NewTransactionOverlay.of(context).pushPage("Select Account", SelectDestinationAccountPage(
                  source: source,
                ));
              }),
              SmallFormDivider(),
              buildButton(context, "Convert", "Convert ICP into cycles to power canisters", () {}),
              SmallFormDivider(),
              buildButton(context, "Stake", "Stake ICP in a neuron to participate in governance", () {
                NewTransactionOverlay.of(context).pushPage("Stake Neuron", StakeNeuronPage(source: source));
              }),
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
            if(states.contains(MaterialState.pressed)){
              return AppColors.blue600;
            }else{
              return AppColors.blue600;
            }
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
