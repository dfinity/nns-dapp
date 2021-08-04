import 'dart:math';

import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/wallet/percentage_display_widget.dart';
import '../../../dfinity.dart';

GlobalKey _toolTipKey = GlobalKey();

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
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
                            style: Responsive.isMobile(context)
                                ? context.textTheme.headline6
                                : context.textTheme.headline3,
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
                IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      PercentageDisplayWidget(
                        amount: neuron.stake.asE8s() > BigInt.zero
                            ? (100 *
                                (neuron.maturityICPEquivalent.asE8s() /
                                    neuron.stake.asE8s()))
                            : 0,
                        amountSize: Responsive.isMobile(context) ? 20 : 24,
                        locale: myLocale.languageCode,
                      ),
                      Expanded(
                          child: ConstrainedBox(
                              constraints: BoxConstraints(minHeight: 40),
                              child: Container())),
                      Row(
                        children: [
                          ElevatedButton(
                              onPressed: () {
                                OverlayBaseWidget.show(
                                    context,
                                    NeuronMergeMaturity(
                                        neuron: neuron,
                                        cancelTitle: "Skip",
                                        onCompleteAction: (context) {
                                          OverlayBaseWidget.of(context)
                                              ?.dismiss();
                                        }));
                              }.takeIf((e) =>
                                  neuron.stake.asE8s() > BigInt.zero &&
                                  neuron.isCurrentUserController),
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  "Merge Neuron",
                                  style: TextStyle(
                                      fontSize: Responsive.isMobile(context)
                                          ? 14
                                          : 16),
                                ),
                              )),
                          SizedBox(width: 10.0),
                          ElevatedButton(
                              onPressed: () {
                                OverlayBaseWidget.show(
                                    context,
                                    ConfirmDialog(
                                      title: "Really Spawn Neuron",
                                      description:
                                          "Are you sure you wish to spawn a new neuron?",
                                      onConfirm: () async {
                                        context.callUpdate(() async {
                                          final newNeuron = await context.icApi
                                              .spawnNeuron(
                                                  neuronId: neuron
                                                      .identifier.toBigInt);
                                          context.nav.push(
                                              NeuronPageDef.createPageConfig(
                                                  newNeuron));
                                        });
                                      },
                                    ));
                              }.takeIf((e) =>
                                  neuron.maturityICPEquivalent.asE8s() >
                                      BigInt.from(E8S_PER_ICP) &&
                                  neuron.isCurrentUserController),
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  "Spawn Neuron",
                                  style: TextStyle(
                                      fontSize: Responsive.isMobile(context)
                                          ? 14
                                          : 16),
                                ),
                              )),
                        ],
                      ),
                    ],
                  ),
                )
              ],
            ),
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
  late IntField sliderValueSeconds;
  late double sliderMinValue;

  @override
  void initState() {
    super.initState();
    sliderValueSeconds = IntField("Disburse Delay", []);
    sliderValueSeconds.currentValue = widget.neuron.dissolveDelay.inSeconds;
    sliderMinValue = sqrt(widget.neuron.dissolveDelay.inSeconds);
  }

  Future performUpdate(BuildContext context) async {
    await context.callUpdate(() => context.icApi.increaseDissolveDelay(
        neuronId: widget.neuron.id.toBigInt,
        additionalDissolveDelaySeconds: sliderValueSeconds.currentValue -
            widget.neuron.dissolveDelaySeconds.toInt()));
    widget.onCompleteAction(context);
  }

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
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
                      top: 42.0, left: 42.0, right: 42.0, bottom: 20.0),
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
                              text: widget.neuron.stake
                                  .asString(myLocale.languageCode),
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
                        DissolveDelayWidget(
                          sliderMinValue: sliderMinValue,
                          sliderValueSeconds: sliderValueSeconds.currentValue,
                          currentDelay:
                              widget.neuron.dissolveDelaySeconds.toInt(),
                          onUpdate: (delay) {
                            setState(() {
                              sliderValueSeconds.currentValue = delay;
                            });
                          },
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: _FigureWidget(
                                amount: widget.neuron.stake.toString(),
                                label: "Voting Power",
                              ),
                            ),
                            Expanded(
                                child: _FigureWidget(
                              amount: sliderValueSeconds.currentValue.seconds
                                  .yearsDayHourMinuteSecondFormatted(),
                              label: "Dissolve Delay",
                            ))
                          ],
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
                    final newDelay = sliderValueSeconds.currentValue.seconds;
                    OverlayBaseWidget.show(
                        context,
                        ConfirmDialog(
                          title: "Confirm Merge Neuron",
                          description:
                              "After complete, the dissolve delay will be ${newDelay.yearsDayHourMinuteSecondFormatted()}",
                          onConfirm: () async {
                            await performUpdate(context);
                          },
                        ));
                  }.takeIf((e) =>
                      sliderValueSeconds.currentValue >
                      widget.neuron.dissolveDelay.inSeconds),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class DissolveDelayWidget extends StatelessWidget {
  final double sliderMinValue;
  final int sliderValueSeconds;
  final Function(int) onUpdate;
  final int currentDelay;

  const DissolveDelayWidget(
      {Key? key,
      required this.sliderMinValue,
      required this.sliderValueSeconds,
      required this.currentDelay,
      required this.onUpdate})
      : super(key: key);

  int get maxDelay => (365.25 * 8).days.inSeconds;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text(
            "Merge Neuron",
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
              "Choose your how much of your reward to stake to the neurons in ICP ",
              style: context.textTheme.subtitle2),
        ),
        SizedBox(
          height: 10,
        ),
        Slider(
          activeColor: AppColors.white,
          inactiveColor: AppColors.gray600,
          value: sqrt(sliderValueSeconds),
          min: 0,
          max: sqrt(maxDelay),
          divisions: 10000,
          onChanged: (double value) {
            if (value < sliderMinValue) {
              value = sliderMinValue;
            }
            onUpdate(min(maxDelay, (value * value).toInt()));
          },
        ),
      ],
    );
  }
}

class _FigureWidget extends StatelessWidget {
  final String amount;
  final String label;

  const _FigureWidget({Key? key, required this.amount, required this.label})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            amount,
            style: Responsive.isMobile(context)
                ? context.textTheme.headline4
                : context.textTheme.headline3,
          ),
          SizedBox(
            height: 5,
          ),
          Text(
            label,
            style: context.textTheme.subtitle2,
          ),
        ],
      ),
    );
  }
}
