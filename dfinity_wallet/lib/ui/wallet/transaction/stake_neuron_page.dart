import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:uuid/uuid.dart';

import '../../../dfinity.dart';
import 'package:dartx/dartx.dart';
import 'dart:math';

class StakeNeuronPage extends StatefulWidget {
  final Wallet wallet;

  const StakeNeuronPage({Key? key, required this.wallet}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {
  ValidatedTextField name = ValidatedTextField("Neuron Name",
      validations: [StringFieldValidation.minimumLength(2)]);
  late ValidatedTextField amountField;
  late IntField disperseDelay;

  @override
  void initState() {
    amountField = ValidatedTextField("Amount",
        validations: [
          FieldValidation("Not enough ICP in wallet",
              (e) => (e.toIntOrNull() ?? 0) > widget.wallet.balance),
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
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: ListView(
                children: [
                  ListTile(
                    title: Text(
                      "Stake a Neuron",
                      style: context.textTheme.headline2
                          ?.copyWith(color: AppColors.gray800),
                    ),
                  ),
                  TallFormDivider(),
                  DebouncedValidatedFormField(name),
                  SmallFormDivider(),
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
          ),
          VotingPowerWidget(
            amount: votingPower.toStringAsFixed(2),
          ),
          SmallFormDivider(),
          Container(
            width: double.infinity,
            color: AppColors.gray100,
            height: 100,
            padding: EdgeInsets.all(20.0),
            child: ElevatedButton(
              child: Text("Create"),
              onPressed: () {
                context.boxes.neurons.add(Neuron(
                    name: name.currentValue,
                    address: Uuid().v4(),
                    durationRemaining: disperseDelay.currentValue.toDouble(),
                    timerIsActive: false,
                    rewardAmount: 0));
                context.nav.push(NeuronsTabsPageConfiguration);
              }.takeIf((e) => <ValidatedField>[name, amountField, disperseDelay]
                  .allAreValid),
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
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              "Lockup Duration",
              style: context.textTheme.bodyText1.gray800,
            ),
            SmallFormDivider(),
            Slider(
              value: sqrt(sqrt(timeInSeconds)),
              min: 0,
              max: sqrt(sqrt(maxDelay)),
              divisions: 1000,
              onChanged: (double value) {
                onUpdate((value * value * value * value).toInt());
              },
            ),
            SizedBox(
                width: double.infinity,
                child: Center(
                    child: Text(
                  timeInSeconds.seconds.yearsDayHourMinuteSecondFormatted(),
                  style: context.textTheme.bodyText1.gray800,
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
            style: context.textTheme.headline3.gray800,
          ),
          SmallFormDivider(),
          Text(
            amount,
            style: context.textTheme.headline2.gray800,
          ),
          Text(
            "Voting power is given when neurons are locked for at least 6 months",
            style: TextStyle(
                fontSize: 12,
                fontFamily: Fonts.circularBook,
                color: AppColors.gray800),
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
