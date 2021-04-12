import 'dart:convert';
import 'dart:html';
import 'dart:js_util';

import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';
import 'package:dfinity_wallet/ic_api/web/js_utils.dart';
import 'package:hive/hive.dart';

import '../../dfinity.dart';
import 'governance_api.dart';

class ProposalSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchProposals() async {
    final res = await promiseToFuture(governanceApi.listProposals(jsify({
      'limit': 100,
      'includeRewardStatus': [0, 1, 2, 3, 4],
      'excludeTopic': [],
      'includeStatus': []
    })));

    final string = governanceApi.jsonString(res);
    print("proposals response ${string}");
    dynamic response = jsonDecode(string);
    response!['proposals']?.forEach((e) {
      storeProposal(e);
    });

    linkProposalsToNeurons();
  }

  void storeProposal(dynamic response) async {
    final proposalId = response['id'].toString();
    print("Fetched proposal ${proposalId}");
    if (!hiveBoxes.proposals.containsKey(proposalId)) {
      final proposal = Proposal.empty();
      updateProposal(proposal, proposalId, response);
      await hiveBoxes.proposals.put(proposalId, proposal);
    } else {
      final proposal = hiveBoxes.proposals.get(proposalId)!;
      updateProposal(proposal, proposalId, response);
      proposal.save();
    }
  }

  void updateProposal(Proposal proposal, String proposalId, dynamic response) {
    proposal.id = proposalId.toString();
    proposal.summary = response['proposal']['summary'].toString();
    proposal.url = response['proposal']['url'];
    proposal.proposer = response['proposer'].toString();
    proposal.no = response['latestTally']['yes'].toString().toInt();
    proposal.yes = response['latestTally']['no'].toString().toInt();
    proposal.action = response['proposal']['action'];

    proposal.executedTimestampSeconds = response['executedTimestampSeconds'].toString();
    proposal.failedTimestampSeconds = response['failedTimestampSeconds'].toString();
    proposal.decidedTimestampSeconds = response['decidedTimestampSeconds'].toString();
    proposal.proposalTimestampSeconds = response['proposalTimestampSeconds'].toString();

    // print("");
    // print("proposal");
    // print("proposal.id: ${proposal.id}");
    // print("proposal.text: ${proposal.text}");
    // print("proposal.url: ${proposal.url}");
    // print("proposal.proposer: ${proposal.proposer}");
    // print("proposal.status: ${proposal.status}");
    // print("proposal.no: ${proposal.no}");
    // print("proposal.yes: ${proposal.yes}");
  }

  void linkProposalsToNeurons() {
    final byProposer =
        hiveBoxes.proposals.values.groupBy((element) => element.proposer);
    hiveBoxes.neurons.values.forEach((element) {
      element.proposals = HiveList(hiveBoxes.proposals)
        ..addAll(byProposer[element.id] ?? []);
      ;
    });
  }
}
