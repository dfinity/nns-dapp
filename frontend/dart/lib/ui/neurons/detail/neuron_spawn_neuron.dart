import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:universal_html/js.dart' as js;
import '../../../nns_dapp.dart';

class SpawnNeuron extends StatefulWidget {
  final Neuron neuron;
  final String cancelTitle;
  final Function(BuildContext context) onCompleteAction;

  const SpawnNeuron({Key? key, required this.neuron, this.cancelTitle = "Cancel", required this.onCompleteAction})
      : super(key: key);

  @override
  _SpawnNeuronState createState() => _SpawnNeuronState();
}

class _SpawnNeuronState extends State<SpawnNeuron> {
  late IntField sliderValue;
  late int percentageStake;

  @override
  void initState() {
    super.initState();
    sliderValue = IntField("Spawn Neuron", []);
    sliderValue.currentValue = 0;
  }

  Future performUpdate(BuildContext context) async {
    try {
      final newNeuron = await context.callUpdate(
          () => context.icApi.spawnNeuron(neuron: widget.neuron, percentageToSpawn: sliderValue.currentValue));
      context.nav.push(neuronPageDef.createPageConfig(newNeuron));
    } catch (err) {
      js.context.callMethod("alert", ["$err"]);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 40.0, left: 40.0, right: 40.0, bottom: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectableText(
                        widget.neuron.identifier,
                        style: Responsive.isMobile(context) ? context.textTheme.headline6 : context.textTheme.headline2,
                      ),
                      SizedBox(
                        height: 10.0,
                      ),
                      RichText(
                          text: TextSpan(
                              text: widget.neuron.stake.asString(),
                              style: context.textTheme.bodyText1,
                              children: [TextSpan(text: " ICP Stake", style: context.textTheme.bodyText2)])),
                      SizedBox(
                        height: 10.0,
                      ),
                    ],
                  ),
                ),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 42.0),
                    child: Column(
                      children: [
                        SpawnNeuronStake(
                          sliderValue: sliderValue.currentValue,
                          onUpdate: (value) {
                            setState(() {
                              sliderValue.currentValue = value;
                            });
                          },
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Center(
                            child: Text(
                              '${sliderValue.currentValue}%',
                              style: Responsive.isMobile(context)
                                  ? context.textTheme.headline4
                                  : context.textTheme.headline3,
                            ),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Container(
          width: double.infinity,
          color: AppColors.lightBackground,
          height: 100,
          padding: Responsive.isMobile(context)
              ? EdgeInsets.symmetric(horizontal: 30, vertical: 16)
              : EdgeInsets.symmetric(horizontal: 64, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ButtonStyle(backgroundColor: MaterialStateProperty.all(AppColors.gray500)),
                  child: Text(
                    widget.cancelTitle,
                    style: TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
                  ),
                  onPressed: () async {
                    widget.onCompleteAction(context);
                  },
                ),
              ),
              SizedBox(
                width: 10,
              ),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  child: Text(
                    "Confirm",
                    style: TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
                  ),
                  onPressed: () {
                    OverlayBaseWidget.show(
                      context,
                      ConfirmDialog(
                        title: "Really Spawn Neuron",
                        description:
                            "Are you sure you wish to spawn a new neuron? This will use ${sliderValue.currentValue}% of your neuron's earned maturity for the new neuron",
                        onConfirm: () async {
                          await performUpdate(context);
                        },
                      ),
                    );
                  }.takeIf(
                    (e) => ((BigInt.from(sliderValue.currentValue) * widget.neuron.maturityICPEquivalent.asE8s()) >
                        BigInt.from(E8S_PER_ICP * 100)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class SpawnNeuronStake extends StatelessWidget {
  final int sliderValue;
  final Function(int) onUpdate;

  const SpawnNeuronStake({Key? key, required this.sliderValue, required this.onUpdate}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text(
            "Spawn Neuron",
            style: Responsive.isMobile(context) ? context.textTheme.headline6 : context.textTheme.headline3,
          ),
        ),
        SizedBox(
          height: 5,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text("Choose how much of your neuron's maturity to give to the new neuron ",
              style: context.textTheme.subtitle2),
        ),
        SizedBox(
          height: 10,
        ),
        Slider(
          activeColor: AppColors.white,
          inactiveColor: AppColors.gray600,
          value: sliderValue.toDouble(),
          min: 0,
          max: 100,
          label: sliderValue.toString(),
          onChanged: (double value) {
            onUpdate(value.toInt());
          },
        ),
      ],
    );
  }
}
