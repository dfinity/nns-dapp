import 'dart:convert';

import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
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
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    proposal.summary,
                    style: context.textTheme.headline3,
                  ),
                ),
                Container(
                  decoration: ShapeDecoration(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side:
                              BorderSide(width: 2, color: Color(0xffFBB03B)))),
                  child: Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      proposal.status.description,
                      style: TextStyle(
                          fontSize: 24,
                          fontFamily: Fonts.circularBook,
                          color: Color(0xffFBB03B),
                          fontWeight: FontWeight.normal),
                    ),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () => launch(proposal.url),
              child: Text(
                proposal.url,
                style: context.textTheme.subtitle2?.copyWith(color: Colors.blue),
              ),
            ),
            Text(
              "Proposer: ${proposal.proposer}",
              style: context.textTheme.subtitle2,
            ),
            Text(
              "Topic: ${proposal.topic.toString().removePrefix("Topic.")}",
              style: context.textTheme.subtitle2,
            ),
            Text(
              "Identifier: ${proposal.id}",
              style: context.textTheme.subtitle2,
            ),
            SmallFormDivider(),
            ActionDetailsWidget(proposal: proposal,)
          ],
        ),
      ),
    );
  }
}

class ActionDetailsWidget extends StatelessWidget {

  final Proposal proposal;

  const ActionDetailsWidget({Key? key, required this.proposal}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final actionKey = proposal.action.keys.firstOrNull;
    if(actionKey == null) return Container();
    final fields = proposal.action[actionKey] as Map<dynamic, dynamic>;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.mediumBackground,
        borderRadius: BorderRadius.circular(10)
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(actionKey, style: context.textTheme.headline4),
            ),
          ),
          ...fields.entries.map((entry) => Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(entry.key, style: context.textTheme.bodyText1?.copyWith(fontSize: 14, color: AppColors.gray50),),
                Text(entry.value.toString().toString(), style: context.textTheme.subtitle2,)
              ],
            ),
          ))
        ],
      ),
    );
  }

}


