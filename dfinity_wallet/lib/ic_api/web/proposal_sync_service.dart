
import 'dart:js_util';

import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';

import '../../dfinity.dart';
import 'governance_api.dart';

class ProposalSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchProposals() async {
    final response = await promiseToFuture(governanceApi.getPendingProposals());
    response.forEach((e) {
      storeProposal(e);
    });
  }

  void storeProposal(dynamic response) async {
    final neuronId = response.id.id.toString();
    print("Fetched proposal ${neuronId}");
    if (!hiveBoxes.proposals.containsKey(neuronId)) {
      await hiveBoxes.proposals.put(neuronId, Proposal.empty());
    }
    final proposal = hiveBoxes.proposals.get(neuronId)!;
    updateNeuron(proposal, neuronId, response);
    proposal.save();
  }

  void updateNeuron(Proposal proposal, String neuronId, response) {
    proposal.id = neuronId;
    proposal.text = response.proposal.summary.toString();
    proposal.url = response.proposal.url;
    proposal.proposer = response.proposer.id.toString();
    proposal.status = "Open";
    proposal.no = response.latestTally.yes.toString().toInt();
    proposal.yes = response.latestTally.no.toString().toInt();
  }
}

