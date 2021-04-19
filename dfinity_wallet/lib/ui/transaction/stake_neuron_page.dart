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
    disperseDelay.currentValue = 365.days.inSeconds;
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
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: 500),
                            child: DebouncedValidatedFormField(
                              amountField,
                              onChanged: () {
                                setState(() {});
                              },
                            ),
                          ),
                        ),
                        SmallFormDivider(),
                        AnimatedOpacity(
                          duration: 0.5.seconds,
                          opacity: (amountField.currentValue.toDoubleOrNull() != null) ? 1 : 0,
                          child: Container(
                            padding: EdgeInsets.all(32),
                            margin: EdgeInsets.only(top: 10),
                            decoration: BoxDecoration(
                                border: Border.all(color: AppColors.gray600, width: 2),
                                borderRadius: BorderRadius.circular(10)
                            ),
                            child: Column(
                              children: [
                                DisperseDelayWidget(
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
                            ),
                          ),
                        ),
                      ],
                    ),
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
            padding: EdgeInsets.symmetric(horizontal: 64, vertical: 16),
            child: ElevatedButton(
              child: Text("Create"),
              onPressed: () async {
                await context.performLoading(() => context.icApi.createNeuron(
                    stakeInDoms: amountField.currentValue.toDouble().toDoms,
                    dissolveDelayInSecs:
                        BigInt.from(disperseDelay.currentValue),
                    fromSubAccount: widget.source.subAccountId));
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
      1 +
      (disperseDelay.currentValue
              .toDouble()
              .takeIf((e) => e.seconds.inDays > (365 / 2))
              ?.let((e) => e / (365 * 8).days.inSeconds) ??
          0);
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
