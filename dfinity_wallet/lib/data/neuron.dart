import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'dfinity_entity.dart';
import 'followee.dart';
import 'neuron_state.dart';
import 'package:core/extensions.dart';
import 'package:dartx/dartx.dart';


class Neuron extends DfinityEntity with ICPSource {
  late String id;
  late List<BallotInfo> recentBallots;
  late String createdTimestampSeconds;
  late String votingPower;
  late NeuronState state;
  late String dissolveDelaySeconds;
  late String cachedNeuronStakeDoms;
  late String neuronFeesDoms;
  late String maturityE8sEquivalent;
  late String? whenDissolvedTimestampSeconds;
  late List<Followee> followees;
  List<Proposal>? proposals;
  late int followEditCounter;
  late bool isCurrentUserController;

  Neuron({
    required this.id,
    required this.recentBallots,
    required this.createdTimestampSeconds,
    required this.votingPower,
    required this.state,
    required this.dissolveDelaySeconds,
    required this.cachedNeuronStakeDoms,
    required this.proposals,
    required this.followEditCounter,
    required this.isCurrentUserController
  });

  Neuron.empty();

  @override
  String get identifier => id.toString();

  @override
  String get address => id.toString();

  @override
  int? get subAccountId => null;

  BigInt get stake => cachedNeuronStakeDoms.toBigInt - neuronFeesDoms.toBigInt;

  @override
  String get balance => stake.toString();

  DateTime get whenDissolvedTimestamp => whenDissolvedTimestampSeconds.secondsToDateTime();

  Duration get durationRemaining => whenDissolvedTimestamp.difference(DateTime.now());

  Duration get dissolveDelay => int.parse(dissolveDelaySeconds).seconds;

  Vote? voteForProposal(Proposal proposal) => recentBallots.firstOrNullWhere((element) => element.proposalId == proposal.id)?.vote;

  @override
  ICPSourceType get type => ICPSourceType.NEURON;
}




