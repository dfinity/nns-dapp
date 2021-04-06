
import 'dart:js_util';

import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';
import 'package:dfinity_wallet/ic_api/web/js_utils.dart';

import '../../dfinity.dart';
import 'governance_api.dart';

class ProposalSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchProposals() async {
    final response = await callApi(governanceApi.listProposals, {
      'limit': 100,
      'includeRewardStatus': [0,1,2,3,4],
      'excludeTopic': [],
      'includeStatus': []
    });
    print(response.proposals);
    response.proposals.forEach((e) {
      storeProposal(e);
    });
  }

  void storeProposal(dynamic response) async {
    final proposalId = response.id.toString();
    print("Fetched proposal ${proposalId}");
    if (!hiveBoxes.proposals.containsKey(proposalId)) {
      final proposal = Proposal.empty();
      updateProposal(proposal, proposalId, response);
      await hiveBoxes.proposals.put(proposalId, proposal);
    }else{
      final proposal = hiveBoxes.proposals.get(proposalId)!;
      updateProposal(proposal, proposalId, response);
      proposal.save();
    }
  }

  void updateProposal(Proposal proposal, String proposalId, response) {
    proposal.id = proposalId.toString();
    proposal.text = response.proposal.summary.toString();
    proposal.url = response.proposal.url;
    proposal.proposer = response.proposer.id.toString();
    proposal.status = "Open";
    proposal.no = response.latestTally.yes.toString().toInt();
    proposal.yes = response.latestTally.no.toString().toInt();
  }
}

