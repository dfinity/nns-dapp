import 'package:nns_dapp/ui/_components/responsive.dart';
import '../../../nns_dapp.dart';

class ProposalSummaryWidget extends StatelessWidget {
  final BigInt proposalId;
  const ProposalSummaryWidget({Key? key, required this.proposalId})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Proposal? proposal = context.boxes.proposals[proposalId.toString()];
    if (proposal == null) {
      context.icApi.fetchProposal(proposalId: proposalId);
    }
    return StreamBuilder(
        stream: context.boxes.proposals.changes,
        builder: (context, snapshot) {
          final Proposal? proposal =
              context.boxes.proposals[proposalId.toString()];
          if (proposal != null) {
            return Text(proposal.summary,
                style: Responsive.isMobile(context)
                    ? context.textTheme.bodyText2
                    : context.textTheme.bodyText1);
          } else {
            return Text(proposalId.toString());
          }
        });
  }
}
