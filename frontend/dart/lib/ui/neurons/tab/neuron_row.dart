import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../../nns_dapp.dart';

class NeuronRow extends StatelessWidget {
  final Neuron neuron;
  final bool showsWarning;

  const NeuronRow({Key? key, required this.neuron, this.showsWarning = false})
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
                    style: context.textTheme.headline3,
                  ),
                  if (neuron.isCommunityFundNeuron)
                    Text("[community fund]",
                        style: context.textTheme.headline5),
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
              flex: 2,
              child: LabelledBalanceDisplayWidget(
                  amount: neuron.stake,
                  amountSize: Responsive.isMobile(context) ? 16 : 20,
                  icpLabelSize: 25,
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
              Expanded(
                child: Text(
                    "${neuron.dissolveDelay.yearsDayHourMinuteSecondFormatted()}",
                    style: context.textTheme.subtitle2),
              ),
              Expanded(
                  flex: 2,
                  child: Text(" Dissolve Delay",
                      style: context.textTheme.subtitle2))
            ],
          ),
          SizedBox(
            height: 5,
          ),
        ]
      ],
    );
  }
}
