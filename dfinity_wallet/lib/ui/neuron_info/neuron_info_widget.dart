import 'package:dfinity_wallet/ic_api/web/neuron_sync_service.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
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
              final neuronInfo = snapshot.data;
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SelectableText(
                          neuron.neuronId.toString(),
                          style: context.textTheme.headline3,
                          onTap: () {},
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
                                width: 25,
                                height: 25,
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
                LabelledBalanceDisplayWidget(
                    amount: neuron.votingPower.toICPT,
                    amountSize: 30,
                    icpLabelSize: 15,
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
                  style: context.textTheme.subtitle2),
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
                  child: Text("Voting History", style: context.textTheme.headline3),
                ),
              ],
            ),
            SmallFormDivider(),
            ...neuron.recentBallots
                .distinctBy((element) => element.proposalId)
                .map((e) {
              return Container(
                padding: EdgeInsets.all(8),
                child: Row(
                  children: [
                    Expanded(
                      child: ProposalSummaryWidget(
                       proposalId: e.proposalId.toBigInt,
                      ),
                    ),
                    Text(e.vote.toString().removePrefix("Vote."),
                        style: context.textTheme.headline3)
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
