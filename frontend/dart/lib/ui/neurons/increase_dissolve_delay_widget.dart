import 'dart:math';
import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:universal_html/js.dart' as js;
import '../../nns_dapp.dart';

class IncreaseDissolveDelayWidget extends StatefulWidget {
  final Neuron neuron;
  final String cancelTitle;
  final Function(BuildContext context) onCompleteAction;

  const IncreaseDissolveDelayWidget(
      {Key? key,
      required this.neuron,
      this.cancelTitle = "Cancel",
      required this.onCompleteAction})
      : super(key: key);

  @override
  _IncreaseDissolveDelayWidgetState createState() =>
      _IncreaseDissolveDelayWidgetState();
}

class _IncreaseDissolveDelayWidgetState
    extends State<IncreaseDissolveDelayWidget> {
  late IntField sliderValueSeconds;
  late double sliderMinValue;

  @override
  void initState() {
    super.initState();
    sliderValueSeconds = IntField("Disburse Delay", []);
    sliderValueSeconds.currentValue = widget.neuron.dissolveDelay.inSeconds;
    sliderMinValue = sqrt(widget.neuron.dissolveDelay.inSeconds);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Padding(
                  padding: const EdgeInsets.only(
                      top: 42.0, left: 30.0, right: 42.0, bottom: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Neuron ID', style: context.textTheme.headline3),
                      VerySmallFormDivider(),
                      SelectableText(
                        widget.neuron.identifier,
                        style: context.textTheme.bodyText1,
                      ),
                      TallFormDivider(),
                      Text('Balance', style: context.textTheme.headline3),
                      VerySmallFormDivider(),
                      RichText(
                          text: TextSpan(
                              text: widget.neuron.stake.asString(),
                              style: context.textTheme.bodyText1,
                              children: [
                            TextSpan(
                              text: " ICP Stake",
                              style: context.textTheme.bodyText1,
                            )
                          ])),
                      TallFormDivider(),
                      Text("Current Dissolve Delay",
                          style: context.textTheme.headline3),
                      VerySmallFormDivider(),
                      RichText(
                          text: TextSpan(
                        text: widget.neuron.dissolveDelaySeconds
                            .toInt()
                            .seconds
                            .yearsDayHourMinuteSecondFormatted(),
                        style: context.textTheme.bodyText1,
                      )),
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
                                amount: votingPower,
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
                    "Update Delay",
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 16),
                  ),
                  onPressed: () {
                    final newDelay = sliderValueSeconds.currentValue.seconds;
                    OverlayBaseWidget.show(
                        context,
                        ConfirmDialog(
                          title: "Confirm Dissolve Delay Increase",
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

  Future performUpdate(BuildContext context) async {
    final res = await context.callUpdate(() => context.icApi
        .increaseDissolveDelay(
            neuron: widget.neuron,
            additionalDissolveDelaySeconds: sliderValueSeconds.currentValue -
                widget.neuron.dissolveDelaySeconds.toInt()));

    res.when(
        ok: (unit) => widget.onCompleteAction(context),
        err: (err) => js.context.callMethod("alert", ["$err"]));
  }

  String get votingPower => isMoreThan6Months()
      ? (widget.neuron.stake.asDouble() * votingMultiplier()).toStringAsFixed(2)
      : "-";

  double votingMultiplier() =>
      1 +
      (sliderValueSeconds.currentValue
              .toDouble()
              .takeIf((e) => isMoreThan6Months())
              ?.let((e) => e / EIGHT_YEARS_IN_SECONDS) ??
          0);

  bool isMoreThan6Months() =>
      sliderValueSeconds.currentValue > SIX_MONTHS_IN_SECONDS;
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
            "Dissolve Delay",
            style: context.textTheme.headline3,
          ),
        ),
        SizedBox(
          height: 5,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 42.0),
          child: Text(
              "Voting power is given when neurons are locked for at least 6 months",
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
