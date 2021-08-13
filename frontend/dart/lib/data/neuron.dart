import 'dart:math';

import 'package:dfinity_wallet/data/ballot_info.dart';
import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/vote.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'dfinity_entity.dart';
import 'followee.dart';
import 'icp.dart';
import 'neuron_state.dart';
import 'package:core/extensions.dart';
import 'package:dartx/dartx.dart';
import 'package:collection/collection.dart';

class Neuron extends DfinityEntity with ICPSource {
  late String id;
  late List<BallotInfo> recentBallots;
  late String createdTimestampSeconds;
  late ICP votingPower;
  late NeuronState state;
  late int dissolveDelaySeconds;
  late int ageSeconds;
  late ICP cachedNeuronStake;
  late ICP neuronFees;
  late ICP maturityICPEquivalent;
  late String? whenDissolvedTimestampSeconds;
  late List<Followee> followees;
  List<Proposal>? proposals;
  late int followEditCounter;
  late bool isCurrentUserController;
  late String accountIdentifier;
  late List<String> hotkeys;

  Neuron(
      {required this.id,
      required this.recentBallots,
      required this.createdTimestampSeconds,
      required this.votingPower,
      required this.state,
      required this.dissolveDelaySeconds,
      required this.ageSeconds,
      required this.cachedNeuronStake,
      required this.proposals,
      required this.followEditCounter,
      required this.isCurrentUserController,
      required this.accountIdentifier,
      required this.hotkeys});

  Neuron.empty();

  double get dissolveDelayMultiplier =>
      1 +
      (1 *
          (min(dissolveDelaySeconds, EIGHT_YEARS_IN_SECONDS).toDouble() /
              EIGHT_YEARS_IN_SECONDS));
  double get ageBonusMultiplier =>
      1 +
      (0.5 *
          (min(ageSeconds, FOUR_YEARS_IN_SECONDS).toDouble() /
              FOUR_YEARS_IN_SECONDS));

  @override
  String get identifier => id.toString();

  @override
  String get address => id.toString();

  @override
  int? get subAccountId => null;

  ICP get stake => cachedNeuronStake - neuronFees;

  @override
  ICP get balance => stake;

  DateTime get whenDissolvedTimestamp =>
      whenDissolvedTimestampSeconds.secondsToDateTime();

  Duration get durationRemaining =>
      whenDissolvedTimestamp.difference(DateTime.now());

  Duration get dissolveDelay => dissolveDelaySeconds.seconds;

  Vote? voteForProposal(Proposal proposal) => recentBallots
      .firstWhereOrNull((element) => element.proposalId == proposal.id)
      ?.vote;

  @override
  ICPSourceType get type => ICPSourceType.NEURON;
}
