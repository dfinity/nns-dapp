import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';
import 'package:dartx/dartx.dart';
import 'dart:math';

class StakeNeuronPage extends StatefulWidget {
  final ICPSource source;

  const StakeNeuronPage({Key? key, required this.source}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {
  late ValidatedTextField amountField;
  late IntField disperseDelay;

  @override
  void initState() {
    amountField = ValidatedTextField("Amount",
        validations: [
          FieldValidation("Not enough ICP",
              (e) => (e.toIntOrNull() ?? 0) > widget.source.icpBalance),
          FieldValidation(
              "Must be greater than 0", (e) => (e.toIntOrNull() ?? 0) == 0)
        ],
        inputType: TextInputType.number);

    disperseDelay = IntField("Disperse Delay", []);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: Center(
                            child: Text(
                              "Stake a Neuron",
                              style: context.textTheme.headline2,
                            ),
                          ),
                        ),
                        TallFormDivider(),
                        DebouncedValidatedFormField(
                          amountField,
                          onChanged: () {
                            setState(() {});
                          },
                        ),
                        SmallFormDivider(),
                        DisperseDelayWidget(
                          timeInSeconds: disperseDelay.currentValue,
                          onUpdate: (delay) {
                            setState(() {
                              disperseDelay.currentValue = delay;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                  VotingPowerWidget(
                    amount: votingPower.toStringAsFixed(2),
                  ),
                  SizedBox(
                    height: 100,
                  )
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            color: AppColors.lightBackground,
            height: 100,
            padding: EdgeInsets.all(20.0),
            child: ElevatedButton(
              child: Text("Create"),
              onPressed: () async {
                await context.performLoading(() => context.icApi.createNeuron(
                    amountField.currentValue.toDouble().toDoms,
                    BigInt.from(disperseDelay.currentValue),
                    widget.source.subAccountId));
                context.nav.push(NeuronTabsPage);
              }.takeIf((e) =>
                  <ValidatedField>[amountField, disperseDelay].allAreValid),
            ),
          )
        ],
      ),
    );
  }

  double get votingPower => amount() * votingMultiplier();

  double amount() => amountField.currentValue.toDoubleOrNull() ?? 0.0;

  double votingMultiplier() =>
      disperseDelay.currentValue
          .toDouble()
          .takeIf((e) => e.seconds.inDays > (365 / 2))
          ?.let((e) => e / (365 * 8).days.inSeconds) ??
      0;
}

class DisperseDelayWidget extends StatelessWidget {
  final int timeInSeconds;
  final Function(int) onUpdate;

  const DisperseDelayWidget(
      {Key? key, required this.timeInSeconds, required this.onUpdate})
      : super(key: key);

  int get maxDelay => (365 * 8).days.inSeconds;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Text(
              "Lockup Period",
              style: context.textTheme.bodyText1,
            ),
            SizedBox(
              height: 5,
            ),
            Text(
              "Voting power is given when neurons are locked for at least 6 months",
              style: TextStyle(
                  fontSize: 16,
                  fontFamily: Fonts.circularBook,
                  color: AppColors.gray200),
            ),
            SizedBox(
              height: 10,
            ),
            Slider(
              activeColor: AppColors.white,
              inactiveColor: AppColors.gray600,
              value: sqrt(sqrt(timeInSeconds)),
              min: 0,
              max: sqrt(sqrt(maxDelay)),
              divisions: 10000,
              onChanged: (double value) {
                onUpdate((value * value * value * value).toInt());
              },
            ),
            SizedBox(
                width: double.infinity,
                child: Center(
                    child: Text(
                  timeInSeconds.seconds.yearsDayHourMinuteSecondFormatted(),
                  style: context.textTheme.bodyText1,
                )))
          ],
        ),
      ),
    );
  }
}

class VotingPowerWidget extends StatelessWidget {
  final String amount;

  const VotingPowerWidget({Key? key, required this.amount}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text(
            "Voting power",
            style: context.textTheme.headline3,
          ),
          SmallFormDivider(),
          Text(
            amount,
            style: context.textTheme.headline2,
          )
        ],
      ),
    );
  }
}

extension DurationFormatter on Duration {
  String yearsDayHourMinuteSecondFormatted() {
    this.toString();
    final years = (inDays / 365).floor();
    return [
      LabelledPeriod("Years", years),
      LabelledPeriod("Days", this.inDays.remainder(365)),
      LabelledPeriod("Hours", this.inHours.remainder(24)),
      LabelledPeriod("Minutes", this.inMinutes.remainder(60)),
      LabelledPeriod("Seconds", this.inSeconds.remainder(60))
    ].filter((element) => element.amount > 0).take(2).map((e) {
      return "${e.amount} ${e.label}";
    }).join(', ');
  }
}

class LabelledPeriod {
  final String label;
  final int amount;

  LabelledPeriod(this.label, this.amount);
}
