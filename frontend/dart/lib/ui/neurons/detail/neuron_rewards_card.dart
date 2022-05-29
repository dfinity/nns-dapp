import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/detail/neuron_spawn_neuron.dart';
import 'package:nns_dapp/ui/wallet/percentage_display_widget.dart';
import 'package:universal_html/js.dart' as js;
import '../../../nns_dapp.dart';

GlobalKey _toolTipKey = GlobalKey();

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);

    var buttonGroup = [
      ElevatedButton(
          onPressed: () {
            OverlayBaseWidget.show(
                context,
                NeuronMergeMaturity(
                    neuron: neuron,
                    cancelTitle: "Skip",
                    onCompleteAction: (context) {
                      OverlayBaseWidget.of(context)?.dismiss();
                    }));
          }.takeIf((e) =>
              neuron.maturityICPEquivalent.asE8s() >
                  ICP.fromE8s(BigInt.from(TRANSACTION_FEE_E8S)).asE8s() &&
              context.icApi.isNeuronControllable(neuron)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Merge Maturity",
              style:
                  TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
            ),
          )),
      if (Responsive.isMobile(context))
        SizedBox(height: 8)
      else
        SizedBox(width: 8),
      neuron.isCurrentUserController
          ? ElevatedButton(
          onPressed: () {
            OverlayBaseWidget.show(
              context,
              SpawnNeuron(
                  neuron: neuron,
                  cancelTitle: "Cancel",
                  onCompleteAction: (context) {
                    OverlayBaseWidget.of(context)?.dismiss();
                  }),
            );
          }.takeIf((e) =>
          neuron.maturityICPEquivalent.asE8s() > BigInt.from(E8S_PER_ICP) &&
              context.icApi.isNeuronControllable(neuron)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Spawn Neuron",
              style: TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
            ),
          ))
          : ElevatedButton(
          onPressed: () {
            OverlayBaseWidget.show(
                context,
                ConfirmDialog(
                  title: "Really Spawn Neuron",
                  description: "Are you sure you wish to spawn a new neuron?",
                  onConfirm: () async {
                    context.callUpdate(() async {
                      try {
                        final newNeuron = await context.icApi.spawnNeuron(neuron: neuron, percentageToSpawn: null);
                        context.nav.push(neuronPageDef.createPageConfig(newNeuron));
                      } catch (err) {
                        js.context.callMethod("alert", ["$err"]);
                      }
                    });
                  },
                ));
          }.takeIf((e) =>
          neuron.maturityICPEquivalent.asE8s() > BigInt.from(E8S_PER_ICP) &&
              context.icApi.isNeuronControllable(neuron)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Spawn Neuron",
              style: TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
            ),
          )),
    ];

    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            "Maturity",
                            style: context.textTheme.headline3,
                          ),
                          GestureDetector(
                            onTap: () {
                              final dynamic _toolTip = _toolTipKey.currentState;
                              _toolTip.ensureTooltipVisible();
                            },
                            child: Tooltip(
                              key: _toolTipKey,
                              padding: EdgeInsets.all(16),
                              margin: Responsive.isMobile(context)
                                  ? const EdgeInsets.only(
                                      left: 100.0, right: 100.0)
                                  : Responsive.isTablet(context)
                                      ? const EdgeInsets.only(
                                          left: 300.0, right: 300.0)
                                      : EdgeInsets.only(
                                          left: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              0.30,
                                          right: 700.0),
                              textStyle: Responsive.isMobile(context)
                                  ? context.textTheme.headline5
                                  : context.textTheme.headline4,
                              message:
                                  "When your neuron votes, its maturity increases. This allows you to spawn a new neuron containing newly minted ICP. Increases in maturity can occur up to 3 days after voting took place.",
                              child: Icon(
                                Icons.info,
                                color: context.textTheme.bodyText1?.color,
                                size: Responsive.isMobile(context) ? 18 : 25,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 24,
                ),
                PercentageDisplayWidget(
                  amount: neuron.stake.asE8s() > BigInt.zero
                      ? (100 *
                          (neuron.maturityICPEquivalent.asE8s() /
                              neuron.stake.asE8s()))
                      : 0,
                  amountSize: Responsive.isMobile(context) ? 16 : 20,
                  locale: myLocale.languageCode,
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            if (Responsive.isMobile(context))
              Center(
                child: Column(
                  children: buttonGroup,
                ),
              )
            else
              Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: buttonGroup)
          ],
        ),
      ),
    );
  }
}

class NeuronMergeMaturity extends StatefulWidget {
  final Neuron neuron;
  final String cancelTitle;
  final Function(BuildContext context) onCompleteAction;

  const NeuronMergeMaturity(
      {Key? key,
      required this.neuron,
      this.cancelTitle = "Cancel",
      required this.onCompleteAction})
      : super(key: key);

  @override
  _NeuronMergeMaturityState createState() => _NeuronMergeMaturityState();
}

class _NeuronMergeMaturityState extends State<NeuronMergeMaturity> {
  late IntField sliderValue;
  late int percentageStake;

  @override
  void initState() {
    super.initState();
    sliderValue = IntField("Merge Neuron", []);
    sliderValue.currentValue = 0;
  }

  Future performUpdate(BuildContext context) async {
    final res = await context.callUpdate(() => context.icApi.mergeMaturity(
        neuron: widget.neuron, percentageToMerge: sliderValue.currentValue));

    res.when(ok: (unit) {
      // Merge maturity succeeded.
      widget.onCompleteAction(context);
    }, err: (err) {
      // Merge maturity failed. Display the error.
      js.context.callMethod("alert", ["$err"]);
    });
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
                  padding: const EdgeInsets.only(
                      top: 40.0, left: 40.0, right: 40.0, bottom: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectableText(
                        widget.neuron.identifier,
                        style: Responsive.isMobile(context)
                            ? context.textTheme.headline6
                            : context.textTheme.headline2,
                      ),
                      SizedBox(
                        height: 10.0,
                      ),
                      RichText(
                          text: TextSpan(
                              text: widget.neuron.stake.asString(),
                              style: context.textTheme.bodyText1,
                              children: [
                            TextSpan(
                                text: " ICP Stake",
                                style: context.textTheme.bodyText2)
                          ])),
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
                        StakeRewardsWidget(
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
                  style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(AppColors.gray500)),
                  child: Text(
                    widget.cancelTitle,
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 16),
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
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 16),
                  ),
                  onPressed: () {
                    OverlayBaseWidget.show(
                        context,
                        ConfirmDialog(
                          title: "Confirm Merge Maturity",
                          description:
                              "This will merge ${sliderValue.currentValue}% of your neuron's earned maturity into its stake",
                          onConfirm: () async {
                            await performUpdate(context);
                          },
                        ));
                  }.takeIf((e) => sliderValue.currentValue > 0),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class StakeRewardsWidget extends StatelessWidget {
  final int sliderValue;
  final Function(int) onUpdate;

  const StakeRewardsWidget(
      {Key? key, required this.sliderValue, required this.onUpdate})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text(
            "Merge Maturity",
            style: Responsive.isMobile(context)
                ? context.textTheme.headline6
                : context.textTheme.headline3,
          ),
        ),
        SizedBox(
          height: 5,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text(
              "Choose how much of your neuron's maturity to merge into its stake ",
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
