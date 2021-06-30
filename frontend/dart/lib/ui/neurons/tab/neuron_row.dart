import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';

import '../../../dfinity.dart';

class NeuronRow extends StatelessWidget {
  final Neuron neuron;
  final bool showsWarning;
  final Function? onTap;

  const NeuronRow(
      {Key? key, required this.neuron, this.onTap, this.showsWarning = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Flexible(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SelectableText(
                    neuron.identifier,
                    style: Responsive.isMobile(context)
                        ? context.textTheme.headline4
                        : context.textTheme.headline2,
                  ),
                  if (!neuron.isCurrentUserController)
                    Text("[hotkey control]",
                        style: context.textTheme.headline5),
                  VerySmallFormDivider(),
                  Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text("${neuron.state.description}",
                        style: context.textTheme.subtitle2?.copyWith(
                          color: neuron.state.statusColor,
                        )),
                    SizedBox(
                      width: 5,
                    ),
                    SvgPicture.asset(
                      neuron.state.iconName,
                      color: neuron.state.statusColor,
                      width: 20,
                      height: 20,
                    ),
                  ]),
                  SizedBox(
                    height: 5,
                  ),
                ],
              ),
            ),
            Flexible(
              flex: 1,
              child: LabelledBalanceDisplayWidget(
                  amount: neuron.stake,
                  amountSize: Responsive.isMobile(context) ? 20 : 30,
                  icpLabelSize: 15,
                  text: Text(
                    "Stake",
                    style: context.textTheme.subtitle2,
                  )),
            ),
          ],
        ),
        if (neuron.state == NeuronState.DISSOLVING) ...[
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                "${neuron.durationRemaining.yearsDayHourMinuteSecondFormatted()}",
                style: context.textTheme.subtitle2,
              ),
              Text(" Remaining", style: context.textTheme.subtitle2)
            ],
          ),
          SizedBox(
            height: 5,
          )
        ],
        if (neuron.state == NeuronState.LOCKED) ...[
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                  "${neuron.dissolveDelay.yearsDayHourMinuteSecondFormatted()}",
                  style: context.textTheme.subtitle2),
              Text(" Dissolve Delay", style: context.textTheme.subtitle2)
            ],
          ),
          SizedBox(
            height: 5,
          )
        ]
      ],
    );
  }
}
