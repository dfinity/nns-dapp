import 'package:core/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neuron_info/neuron_info_widget.dart';
import 'package:nns_dapp/ui/widgets/flutter_json_viewer.dart';

import '../../nns_dapp.dart';
import 'package:url_launcher/url_launcher.dart';

class ProposalStateCard extends StatelessWidget {
  final Proposal proposal;
  final List<Neuron> neurons;

  const ProposalStateCard(
      {Key? key, required this.proposal, required this.neurons})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    proposal.title,
                    style: context.textTheme.headline3,
                  ),
                ),
                SizedBox(width: 20),
                Container(
                  decoration: ShapeDecoration(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                              width: 2, color: proposal.status.color))),
                  child: Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      proposal.status.description,
                      style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 20 : 24,
                          fontFamily: Fonts.circularBook,
                          color: proposal.status.color,
                          fontWeight: FontWeight.normal),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 20.0),
            Container(
              decoration: BoxDecoration(
                color: AppColors.black,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black,
                    spreadRadius: 5,
                  )
                ],
              ),
              child: ClipRRect(
                clipBehavior: Clip.antiAliasWithSaveLayer,
                borderRadius: BorderRadius.all(Radius.circular(10)),
                child: ExpansionTile(
                  initiallyExpanded: true,
                  backgroundColor: AppColors.mediumBackground,
                  collapsedBackgroundColor: AppColors.mediumBackground,
                  title: Center(
                    child: Text(
                      "Proposal Summary",
                      style: context.textTheme.headline3,
                    ),
                  ),
                  children: [
                    Container(
                      color: AppColors.mediumBackground,
                      child: RawScrollbar(
                        thumbColor: Colors.redAccent,
                        radius: Radius.circular(20),
                        thickness: 5,
                        child: Container(
                          height: proposal.summary.length.toDouble() <
                                  kProposalSummaryBoxMaxHeight
                              ? proposal.summary.length.toDouble() +
                                  kProposalSummaryBoxMinHeight
                              : kProposalSummaryBoxMaxHeight,
                          width: MediaQuery.of(context).size.width,
                          child: Markdown(
                              data: proposal.summary,
                              onTapLink: (text, url, title){
                                if(url!=null)
                                launch(url);
                              },
                              styleSheet: MarkdownStyleSheet.fromTheme(
                                  ThemeData(
                                      cardColor: AppColors.black,
                                      textTheme: nnsDappTextTheme(
                                          Responsive.isMobile(context))))),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 10),
            TextButton(
              onPressed: () => launch(proposal.url),
              child: Text(
                proposal.url,
                style:
                    context.textTheme.subtitle2?.copyWith(color: Colors.blue),
              ),
            ),
            TextButton(
                onPressed: () {
                  OverlayBaseWidget.show(
                      context, NeuronInfoWidget(proposal.proposer));
                },
                child: Text(
                  "Proposer: ${proposal.proposer}",
                  style: context.textTheme.subtitle2,
                )),
            Text(
              "Topic: ${proposal.topic.toString().removePrefix("Topic.")}",
              style: context.textTheme.subtitle2,
            ),
            Text(
              "Id: ${proposal.id}",
              style: context.textTheme.subtitle2,
            ),
            SmallFormDivider(),
            SmallFormDivider(),
            ActionDetailsWidget(
              proposal: proposal,
            ),
          ],
        ),
      ),
    );
  }
}

class ActionDetailsWidget extends StatelessWidget {
  final Proposal proposal;

  const ActionDetailsWidget({Key? key, required this.proposal})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final actionKey = proposal.action.keys.firstOrNull;
    if (actionKey == null) return Container();
    final fields = proposal.action[actionKey] as Map<dynamic, dynamic>;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
          color: AppColors.mediumBackground,
          borderRadius: BorderRadius.circular(10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(actionKey, style: context.textTheme.headline4),
            ),
          ),
          ...fields.entries
              .filter((entry) => entry.key != 'payloadBytes')
              .map((entry) {
            return Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    entry.key,
                    style: context.textTheme.bodyText1
                        ?.copyWith(fontSize: 14, color: AppColors.gray50),
                  ),
                  entry.key != 'payload'
                      ? SelectableText(
                    entry.value.toString().toString(),
                    style: context.textTheme.bodyText2,
                  ): JsonViewer(entry.value)
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
