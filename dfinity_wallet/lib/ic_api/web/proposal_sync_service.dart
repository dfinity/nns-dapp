import 'dart:convert';
import 'dart:html';
import 'dart:js_util';

import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/setup/hive_loader_widget.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ic_api/web/js_utils.dart';
import 'package:hive/hive.dart';

import '../../dfinity.dart';
import 'governance_api.dart';
import 'neuron_sync_service.dart';
import 'stringify.dart';

class ProposalSyncService {
  final GovernanceApi governanceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.governanceApi, required this.hiveBoxes});

  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
      required List<ProposalRewardStatus> includeRewardStatus,
      Proposal? beforeProposal}) async {
    final request = {
      'limit': 100,
      if (beforeProposal != null) 'beforeProposal': beforeProposal.id.toBigInt,
      'includeRewardStatus':
          includeRewardStatus.mapToList((e) => e.index.toInt()),
      'excludeTopic': excludeTopics.mapToList((e) => e.index.toInt()),
      'includeStatus': includeStatus.mapToList((e) => e.index.toInt())
    };

    final stopwatch = Stopwatch();
    stopwatch.start();
    print("\n\nfetchProposals request \n" + request.toString());
    final fetchPromise =
        promiseToFuture(governanceApi.listProposals(jsify(request)));
    await cleanProposalCache();
    final res = await fetchPromise;
    final string = stringify(res);
    dynamic response = jsonDecode(string);
    print(
        "\nfetchProposals response in ${stopwatch.elapsed.yearsDayHourMinuteSecondFormatted()} \n ${response}");

    response!['proposals']?.forEach((e) {
      storeProposal(e);
    });

    linkProposalsToNeurons();
  }

  Future<Proposal> storeProposal(dynamic response) async {
    final proposalId = response['id'].toString();
    if (!hiveBoxes.proposals.containsKey(proposalId)) {
      final proposal = Proposal.empty();
      updateProposal(proposal, proposalId, response);
      await hiveBoxes.proposals.put(proposalId, proposal);
      return proposal;
    } else {
      final proposal = hiveBoxes.proposals.get(proposalId)!;
      updateProposal(proposal, proposalId, response);
      proposal.save();
      return proposal;
    }
  }

  void updateProposal(Proposal proposal, String proposalId, dynamic response) {
    proposal.id = proposalId.toString();
    proposal.summary = (response['proposal']['summary'].toString()).replaceAll("Increase minimum neuron stake", "Reflect falling hardware prices - reduce smart contract memory costs by 5%");
    proposal.url = response['proposal']['url'].toString().replaceAll("https://www.lipsum.com/", "https://medium.com/zurich-eth/ic-proposal-reduce-smart-contract-memory-costs/");
    proposal.proposer = response['proposer'].toString();
    proposal.no = response['latestTally']['no'].toString().toInt();
    proposal.yes = response['latestTally']['yes'].toString().toInt();
    proposal.action = response['proposal']['action'];

    proposal.executedTimestampSeconds =
        response['executedTimestampSeconds'].toString();
    proposal.failedTimestampSeconds =
        response['failedTimestampSeconds'].toString();
    proposal.decidedTimestampSeconds =
        response['decidedTimestampSeconds'].toString();
    proposal.proposalTimestampSeconds =
        response['proposalTimestampSeconds'].toString();
    proposal.cacheUpdateDate = DateTime.now();

    print("topic ${response['topic']}");
    print("status ${response['status'].toString().toInt()}");
    print("rewardStatus ${response['rewardStatus'].toString().toInt()}");

    proposal.topic = Topic.values[response['topic'].toString().toInt()];
    proposal.status =
        ProposalStatus.values[response['status'].toString().toInt()];
    proposal.rewardStatus = ProposalRewardStatus
        .values[response['rewardStatus'].toString().toInt()];

    // print("");
    // print("proposal");
    // print("proposal.id: ${proposal.id}");
    // print("proposal.text: ${proposal.text}");
    // print("proposal.url: ${proposal.url}");
    // print("proposal.proposer: ${proposal.proposer}");
    // print("proposal.status: ${proposal.status}");
    // print("proposal.no: ${proposal.no}");
    // print("proposal.yes: ${proposal.yes}");

    print("proposal.topic : ${proposal.topic}");
    print("proposal.status : ${proposal.status}");
    print("proposal.rewardStatus : ${proposal.rewardStatus}");
  }

  void linkProposalsToNeurons() {
    final byProposer =
        hiveBoxes.proposals.values.groupBy((element) => element.proposer);
    hiveBoxes.neurons.values.forEach((element) {
      element.proposals = HiveList(hiveBoxes.proposals)
        ..addAll(byProposer[element.id] ?? []);
    });
  }

  Future<void> cleanProposalCache() async {
    if (hiveBoxes.proposals.length > 0) {
      await Future.wait(hiveBoxes.proposals.values
          .filter((element) =>
              element.cacheUpdateDate == null ||
              element.cacheUpdateDate!.difference(DateTime.now()).inSeconds > 1)
          .map((element) => element.delete()));
    }
  }
}
