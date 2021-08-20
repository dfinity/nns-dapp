import 'package:dfinity_wallet/ic_api/web/neuron_sync_service.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neurons/detail/proposal_summary_widget.dart';

import '../../dfinity.dart';

class NeuronInfoWidget extends StatefulWidget {
  final String neuronId;

  const NeuronInfoWidget(this.neuronId, {Key? key}) : super(key: key);

  @override
  _NeuronInfoWidgetState createState() => _NeuronInfoWidgetState();
}

class _NeuronInfoWidgetState extends State<NeuronInfoWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppColors.lightBackground,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          title: Text("Neuron"),
          actions: [
            if (OverlayBaseWidget.of(context) != null)
              AspectRatio(
                  aspectRatio: 1,
                  child: TextButton(
                    onPressed: () {
                      OverlayBaseWidget.of(context)?.dismiss();
                    },
                    child: Center(
                      child: Text(
                        "✕",
                        style: TextStyle(
                            fontFamily: Fonts.circularBook,
                            fontSize: 24,
                            color: AppColors.white),
                      ),
                    ),
                  )),
          ],
        ),
        body: FutureBuilder<NeuronInfo>(
            future: context.icApi
                .fetchNeuronInfo(neuronId: widget.neuronId.toBigInt),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return SingleChildScrollView(
                    child: ConstrainWidthAndCenter(
                        child: Container(
                  color: AppColors.lightBackground,
                  child: Column(
                    children: [
                      SmallFormDivider(),
                      NeuronInfoCard(neuron: snapshot.data!),
                      NeuronInfoVotesCard(neuron: snapshot.data!),
                      TallFormDivider(),
                    ],
                  ),
                )));
              } else {
                return Center(child: NodeOverlay(null, () {}));
              }
            }));
  }
}

class NeuronInfoCard extends StatelessWidget {
  final NeuronInfo neuron;

  const NeuronInfoCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Flexible(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AutoSizeText(
                          neuron.neuronId.toString(),
                          style: Responsive.isMobile(context)
                              ? context.textTheme.headline6
                              : context.textTheme.headline2,
                          maxLines: 1,
                        ),
                        VerySmallFormDivider(),
                        Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text("${neuron.state.description}",
                                  style: context.textTheme.subtitle2?.copyWith(
                                    color: neuron.state.statusColor,
                                  )),
                              SizedBox(
                                width: 5,
                              ),
                              SizedBox(
                                width: 20,
                                height: 20,
                                child: SvgPicture.asset(
                                  neuron.state.iconName,
                                  color: neuron.state.statusColor,
                                ),
                              ),
                            ]),
                        SizedBox(
                          height: 5,
                        )
                      ]),
                ),
                SizedBox(width: 10.0),
                LabelledBalanceDisplayWidget(
                    amount: neuron.votingPower,
                    amountSize: Responsive.isMobile(context) ? 14 : 30,
                    icpLabelSize: 30,
                    text: Text(
                      "Stake",
                      style: context.textTheme.subtitle2,
                    ))
              ],
            ),
            RichText(
                text: TextSpan(style: context.textTheme.subtitle2, children: [
              TextSpan(
                text: neuron.createdTimestampSeconds
                    .toString()
                    .secondsToDateTime()
                    .dayFormat,
                style: context.textTheme.subtitle2,
              ),
              TextSpan(text: " - Staked"),
            ])),
            VerySmallFormDivider(),
          ],
        ),
      ),
    );
  }
}

class NeuronInfoVotesCard extends StatelessWidget {
  final NeuronInfo neuron;

  const NeuronInfoVotesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                  child: Text("Voting History",
                      style: Responsive.isMobile(context)
                          ? context.textTheme.headline6
                          : context.textTheme.headline3),
                ),
              ],
            ),
            SmallFormDivider(),
            Container(
              child: Row(
                children: [
                  Expanded(
                    child: Text("Proposal Summary",
                        style: Responsive.isMobile(context)
                            ? context.textTheme.bodyText2
                            : context.textTheme.bodyText1),
                  ),
                  Text("Vote",
                      style: Responsive.isMobile(context)
                          ? context.textTheme.bodyText2
                          : context.textTheme.bodyText1)
                ],
              ),
            ),
            SizedBox(height: 10.0),
            ...neuron.recentBallots
                .distinctBy((element) => element.proposalId)
                .map((e) {
              return Container(
                child: Row(
                  children: [
                    Expanded(
                      child: ProposalSummaryWidget(
                        proposalId: e.proposalId.toBigInt,
                      ),
                    ),
                    Text(e.vote.toString().removePrefix("Vote."),
                        style: Responsive.isMobile(context)
                            ? context.textTheme.headline4!
                                .copyWith(fontSize: 14)
                            : context.textTheme.headline3!
                                .copyWith(fontSize: 18))
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
