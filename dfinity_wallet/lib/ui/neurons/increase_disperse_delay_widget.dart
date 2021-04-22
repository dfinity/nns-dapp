
import 'dart:math';

import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';

class IncreaseDisperseDelayWidget extends StatefulWidget {

  final Neuron neuron;

  const IncreaseDisperseDelayWidget({Key? key, required this.neuron}) : super(key: key);

  @override
  _IncreaseDisperseDelayWidgetState createState() => _IncreaseDisperseDelayWidgetState();
}

class _IncreaseDisperseDelayWidgetState extends State<IncreaseDisperseDelayWidget> {

  late IntField disperseDelay;

  @override
  void initState() {
    super.initState();
    disperseDelay = IntField("Disburse Delay", []);
    disperseDelay.currentValue = 365.days.inSeconds;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        DisburseDelayWidget(
          timeInSeconds: disperseDelay.currentValue,
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
                amount: votingPower.toStringAsFixed(2),
                label: "Voting Power",
              ),
            ),
            Expanded(
                child: _FigureWidget(
                  amount: disperseDelay.currentValue.seconds
                      .yearsDayHourMinuteSecondFormatted(),
                  label: "Lockup Period",
                ))
          ],
        )
      ],
    );


    // BigInt.from(disperseDelay.currentValue)
  }

  double get votingPower => amount() * votingMultiplier();

  double amount() => widget.neuron.stake.toICPT;

  double votingMultiplier() =>
      1 +
          (disperseDelay.currentValue
              .toDouble()
              .takeIf((e) => e.seconds.inDays > (365 / 2))
              ?.let((e) => e / (365 * 8).days.inSeconds) ??
              0);
}


class DisburseDelayWidget extends StatelessWidget {
  final int timeInSeconds;
  final Function(int) onUpdate;

  const DisburseDelayWidget(
      {Key? key, required this.timeInSeconds, required this.onUpdate})
      : super(key: key);

  int get maxDelay => (365 * 8).days.inSeconds;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Text(
            "Lockup Period",
            style: context.textTheme.headline3,
          ),
        ),
        SizedBox(
          height: 5,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
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
          value: max(minValue(), sqrt(sqrt(timeInSeconds))),
          min: minValue(),
          max: sqrt(sqrt(maxDelay)),
          divisions: 10000,
          onChanged: (double value) {
            onUpdate((value * value * value * value).toInt());
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
          SizedBox(height: 5,),
          Text(
            label,
            style: context.textTheme.subtitle2,
          ),
        ],
      ),
    );
  }
}
