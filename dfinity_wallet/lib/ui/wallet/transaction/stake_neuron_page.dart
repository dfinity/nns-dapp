import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../../dfinity.dart';

class StakeNeuronPage extends StatefulWidget {

  final Wallet wallet;

  const StakeNeuronPage({Key? key, required this.wallet}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {

  ValidatedField name = ValidatedField("Neuron Name", []);
  late ValidatedField amountField;
  late ValidatedField disperseDelayDays;

  @override
  void initState() {
    amountField = ValidatedField(
        "Amount", [FieldValidation("Not enough ICP in wallet", (e) => (e.toIntOrNull() ?? 0) > widget.wallet.balance)],
        inputType: TextInputType.number);

    disperseDelayDays = ValidatedField(
        "Disperse Delay (Days)", [],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                ListTile(title: Text("Stake a Neuron", style: context.textTheme.headline2,),),
                TallFormDivider(),
                DebouncedValidatedFormField(name),
                SmallFormDivider(),
                DebouncedValidatedFormField(amountField),
                SmallFormDivider(),
                DebouncedValidatedFormField(disperseDelayDays),
              ],
            ),
          ),
          Row(
            children: [
              Expanded(child:NeuronPropertyWidget(
                 title: "Daily Reward",
                amount: "32",
              )),
              Expanded(child:NeuronPropertyWidget(
                title: "Daily Reward",
                amount: "32",
              ))
            ],
          )
        ],
      ),
    );
  }
}


class NeuronPropertyWidget extends StatelessWidget {

  final String title;
  final String amount;

  const NeuronPropertyWidget({Key? key, required this.title, required this.amount}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
