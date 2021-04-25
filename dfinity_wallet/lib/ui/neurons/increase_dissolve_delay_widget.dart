import 'dart:math';

import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';

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
  late IntField disperseDelay;

  @override
  void initState() {
    super.initState();
    disperseDelay = IntField("Disburse Delay", []);
    disperseDelay.currentValue = 0.days.inSeconds;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(42.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectableText(widget.neuron.identifier,
                          style: context.textTheme.headline2),
                      RichText(
                          text: TextSpan(
                              text: widget.neuron.stake.toICPT.toString(),
                              style: context.textTheme.bodyText1,
                              children: [
                            TextSpan(
                                text: " ICP Stake",
                                style: context.textTheme.bodyText2)
                          ])),
                      RichText(
                          text: TextSpan(
                              text: widget.neuron.dissolveDelaySeconds
                                  .toInt()
                                  .seconds
                                  .yearsDayHourMinuteSecondFormatted(),
                              style: context.textTheme.bodyText1,
                              children: [
                            TextSpan(
                                text: " Current Dissolve Delay",
                                style: context.textTheme.bodyText2)
                          ])),
                    ],
                  ),
                ),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 42.0),
                    child: Column(
                      children: [
                        DissolveDelayWidget(
                          timeInSeconds: disperseDelay.currentValue,
                          currentDelay:
                              widget.neuron.dissolveDelaySeconds.toInt(),
                          onUpdate: (delay) {
                            setState(() {
                              disperseDelay.currentValue = delay;
                            });
                          },
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: _FigureWidget(
                                amount: votingPower,
                                label: "New Voting Power",
                              ),
                            ),
                            Expanded(
                                child: _FigureWidget(
                              amount:
                                  (widget.neuron.dissolveDelaySeconds.toInt() +
                                          disperseDelay.currentValue)
                                      .seconds
                                      .yearsDayHourMinuteSecondFormatted(),
                              label: "New Dissolve Delay",
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
          padding: EdgeInsets.symmetric(horizontal: 64, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(AppColors.gray500)),
                  child: Text(widget.cancelTitle),
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
                  child: Text("Update Delay"),
                  onPressed: () {
                    final increase = disperseDelay.currentValue.seconds;
                    final newDelay = widget.neuron.dissolveDelay + increase;
                    OverlayBaseWidget.show(
                        context,
                        ConfirmDialog(
                          title: "Confirm Dissolve Delay Increase",
                          description:
                              "You have selected to increase the dissolve delay by ${increase.yearsDayHourMinuteSecondFormatted()}.\n\nAfter complete, the dissolve delay will be ${newDelay.yearsDayHourMinuteSecondFormatted()}",
                          onConfirm: () async {
                            await performUpdate(context);
                          },
                        ));
                  }.takeIf((e) => disperseDelay.currentValue > 0),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future performUpdate(BuildContext context) async {
    await context.performLoading(() => context.icApi.increaseDissolveDelay(
        neuronId: widget.neuron.id.toBigInt,
        additionalDissolveDelaySeconds: disperseDelay.currentValue));
    widget.onCompleteAction(context);
  }

  String get votingPower => isMoreThan6Months()
      ? (amount() * votingMultiplier()).toStringAsFixed(2)
      : "-";

  double amount() => widget.neuron.stake.toICPT;

  double votingMultiplier() =>
      1 +
      (disperseDelay.currentValue
              .toDouble()
              .takeIf((e) => isMoreThan6Months())
              ?.let((e) => e / (365.25 * 8).days.inSeconds) ??
          0);

  bool isMoreThan6Months() =>
      disperseDelay.currentValue.toDouble() > SIX_MONTHS_IN_SECONDS;
}

const SIX_MONTHS_IN_SECONDS = 182.625 * 24 * 60 * 60;

class DissolveDelayWidget extends StatelessWidget {
  final int timeInSeconds;
  final Function(int) onUpdate;
  final int currentDelay;

  const DissolveDelayWidget(
      {Key? key,
      required this.timeInSeconds,
      required this.currentDelay,
      required this.onUpdate})
      : super(key: key);

  int get maxDelay => (365.25 * 8).days.inSeconds - currentDelay;

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
          value: max(minValue(), sqrt(timeInSeconds)),
          min: minValue(),
          max: sqrt(maxDelay),
          divisions: 10000,
          onChanged: (double value) {
            onUpdate(min(maxDelay, (value * value).toInt()));
          },
        ),
      ],
    );
  }

  double minValue() => 0.0; // sqrt(sqrt(7.001.days.inSeconds.toDouble()));
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
            style: context.textTheme.headline3,
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
