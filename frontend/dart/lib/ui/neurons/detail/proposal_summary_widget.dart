
import '../../../dfinity.dart';

class ProposalSummaryWidget extends StatelessWidget {

  final BigInt proposalId;
  const ProposalSummaryWidget({Key? key, required this.proposalId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final proposal = context.boxes.proposals[proposalId.toString()];
    if(proposal == null){
      context.icApi.fetchProposal(proposalId: proposalId);
    }
    return StreamBuilder(
        stream: context.boxes.proposals.changes,
        builder: (context, snapshot) {
          final proposal = context.boxes.proposals[proposalId.toString()];
          if(proposal != null){
            return Text(proposal.summary);
          }else{
            return Text(proposalId.toString());
          }
        });
  }
}
