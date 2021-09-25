import 'dart:convert';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/proposal_reward_status.dart';
import 'package:nns_dapp/data/topic.dart';
import 'package:universal_html/js_util.dart';
import '../../nns_dapp.dart';
import 'service_api.dart';
import 'stringify.dart';

class ProposalSyncService {
  final ServiceApi serviceApi;
  final HiveBoxesWidget hiveBoxes;

  ProposalSyncService({required this.serviceApi, required this.hiveBoxes});

  Future<void> fetchProposals(
      {required List<Topic> excludeTopics,
      required List<ProposalStatus> includeStatus,
      required List<ProposalRewardStatus> includeRewardStatus,
      Proposal? beforeProposal}) async {
    final request = {
      'limit': 100,
      if (beforeProposal != null)
        'beforeProposal': beforeProposal.id.toBigInt.toJS,
      'includeRewardStatus':
          includeRewardStatus.mapToList((e) => e.index.toInt()),
      'excludeTopic': excludeTopics.mapToList((e) => e.index.toInt()),
      'includeStatus': includeStatus.mapToList((e) => e.index.toInt())
    };

    final stopwatch = Stopwatch();
    stopwatch.start();
    final fetchPromise =
        promiseToFuture(serviceApi.listProposals(jsify(request)));
    if (beforeProposal == null) {
      hiveBoxes.proposals.clear();
    }

    final res = await fetchPromise;
    final string = stringify(res);
    dynamic response = jsonDecode(string);

    response!['proposals']?.forEach((e) {
      storeProposal(e);
    });
    // ignore: deprecated_member_use
    hiveBoxes.proposals.notifyChange();
  }

  bool shouldGetFullProposal(Proposal proposal) {
    if (proposal.action.containsKey('ExecuteNnsFunction')) {
      final nnsFunctionNumber = proposal.action['ExecuteNnsFunction'].nnsFunction;
      const whitelistedNnsFunctions = [1,2,5,6,8,10,11,13,15];
      return whitelistedNnsFunctions.contains(nnsFunctionNumber);
    }
    return false;
  }

  Future<Proposal> getFullProposal(BigInt proposalId) async {
    final response = await promiseToFuture(serviceApi.getProposalInfo(proposalId.toJS));

    final proposal = storeProposal(response);

    return proposal;
  }

  Proposal storeProposal(dynamic response) {
    final proposalId = response['id'].toString();
    if (!hiveBoxes.proposals.containsKey(proposalId)) {
      final proposal = Proposal.empty();
      updateProposal(proposal, proposalId, response);
      hiveBoxes.proposals[proposalId] = proposal;
      return proposal;
    } else {
      final proposal = hiveBoxes.proposals[proposalId];
      updateProposal(proposal, proposalId, response);
      return proposal;
    }
  }

  void updateProposal(Proposal proposal, String proposalId, dynamic response) {
    proposal.id = proposalId.toString();
    proposal.summary = (response['proposal']['summary'].toString()).replaceAll(
        "Increase minimum neuron stake",
        "Reflect falling hardware prices - reduce smart contract memory costs by 5%");
    proposal.url = response['proposal']['url'].toString().replaceAll(
        "https://www.lipsum.com/",
        "https://medium.com/zurich-eth/ic-proposal-reduce-smart-contract-memory-costs/");
    proposal.proposer = response['proposer'].toString();
    proposal.no =
        ICP.fromE8s(response['latestTally']['no'].toString().toBigInt);
    proposal.yes =
        ICP.fromE8s(response['latestTally']['yes'].toString().toBigInt);
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

    proposal.topic = Topic.values[response['topic'].toString().toInt()];
    proposal.status =
        ProposalStatus.values[response['status'].toString().toInt()];
    proposal.rewardStatus = ProposalRewardStatus
        .values[response['rewardStatus'].toString().toInt()];
    proposal.raw = response["proposal"].toString();
    proposal.ballots = parseBallots(response['ballots']);
  }

  Map<String, Ballot> parseBallots(List<dynamic> ballots) {
    return Map.fromIterable(ballots,
        key: (i) => i['neuronId'].toString(),
        value: (i) => Ballot()
          ..proposalId = i['proposalId'].toString()
          ..votingPower = i['votingPower'].toString().toBigInt
          ..vote = Vote.values[i['vote'].toInt()]);
  }
}
