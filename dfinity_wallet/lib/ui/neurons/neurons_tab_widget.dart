import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/neurons/neuron_detail_widget.dart';

class NeuronsPage extends StatefulWidget {
  @override
  _NeuronsPageState createState() => _NeuronsPageState();
}

class _NeuronsPageState extends State<NeuronsPage> {
  @override
  Widget build(BuildContext context) {
    return ConstrainWidthAndCenter(
      child: TabTitleAndContent(
        title: "Neurons",
        children: [
          Card(
            color: AppColors.black,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                "Neurons are long term stores of ICP.\n\n Storing ICP in neurons earns rewards.\n\n ICP stored in neurons give you power to vote on proposals.\n\n Create a neuron from a wallet",
                style: context.textTheme.bodyText1,
                textAlign: TextAlign.center,
              ),
            ),
          ),
          SmallFormDivider(),
          ...context.boxes.neurons.values.mapToList((e) => NeuronRow(
                neuron: e,
                showsWarning: true,
                onPressed: () {
                  context.nav.push(NeuronPageDef.createPageConfig(e));
                },
              )),
        ],
      ),
    );
  }
}

class NeuronRow extends StatelessWidget {
  final Neuron neuron;
  final bool showsWarning;
  final VoidCallback onPressed;

  const NeuronRow(
      {Key? key,
      required this.neuron,
      required this.onPressed,
      this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  neuron.name,
                  style: context.textTheme.headline3
                      ?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(
                    left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  "${neuron.domsBalance} ICP",
                  style: context.textTheme.bodyText1
                      ?.copyWith(color: AppColors.gray800),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
