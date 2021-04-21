import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../../dfinity.dart';

class NeuronRow extends StatelessWidget {
  final Neuron neuron;
  final bool showsWarning;
  final Function? onTap;

  const NeuronRow(
      {Key? key,
      required this.neuron,
        this.onTap,
      this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SelectableText(neuron.identifier,
                  style: context.textTheme.headline2),
              VerySmallFormDivider(),
              Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text("${neuron.state.description}",
                    style: context.textTheme.bodyText2?.copyWith(
                      color: neuron.state.statusColor,
                    )),
                SizedBox(
                  width: 5,
                ),
                SizedBox(
                  width: 30,
                  height: 30,
                  child: SvgPicture.asset(
                    neuron.state.iconName,
                    color: neuron.state.statusColor,
                  ),
                ),
              ]),
              SizedBox(
                height: 5,
              ),
              if (neuron.state == NeuronState.DISSOLVING)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      "${neuron.durationRemaining.yearsDayHourMinuteSecondFormatted()}",
                      style: context.textTheme.bodyText2,
                    ),
                    Text(" Remaining", style: context.textTheme.bodyText2)
                  ],
                ),
              if (neuron.state == NeuronState.LOCKED)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                        "${neuron.dissolveDelay.yearsDayHourMinuteSecondFormatted()}",
                        style: context.textTheme.bodyText1),
                    Text(" Dissolve Delay", style: context.textTheme.bodyText2)
                  ],
                ),
              VerySmallFormDivider(),
              RichText(
                  text: TextSpan(style: context.textTheme.bodyText2, children: [
                TextSpan(text: "Spawned on "),
                TextSpan(
                    text: neuron.createdTimestampSeconds
                        .secondsToDateTime()
                        .dayFormat,
                    style: context.textTheme.bodyText1),
              ]))
            ],
          ),
        ),
        LabelledBalanceDisplayWidget(
            amount: neuron.stake.toICPT,
            amountSize: 30,
            icpLabelSize: 15,
            text: Text("Stake", style: context.textTheme.subtitle2,))
      ],
    );
  }
}
