import 'dart:math';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'ballot_info.dart';
import 'icp_source.dart';
import 'nns_dapp_entity.dart';
import 'followee.dart';
import 'icp.dart';
import 'neuron_state.dart';
import 'package:core/extensions.dart';
import 'package:dartx/dartx.dart';
import 'package:collection/collection.dart';
import 'proposal.dart';
import 'vote.dart';

// TODO(NNS1-701): Use NeuronID everywhere.
class NeuronId {
  final BigInt _id;

  static NeuronId fromString(String s) {
    return new NeuronId._(BigInt.parse(s));
  }

  // Private constructor.
  NeuronId._(this._id);

  BigInt asBigInt() {
    return this._id;
  }

  String toString() {
    return this._id.toString();
  }
}

class Neuron extends NnsDappEntity with ICPSource {
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
  late String controller;
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
      (0.25 *
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

/// A structure used for holding the necessary we need when pulling neuron
/// info from HW wallets.
///
/// TODO(NNS1-698): Remove this once fetchNeurons is fully migrated to using
/// the protobuf endpoints.
class NeuronInfoForHW {
  final NeuronId id;
  final ICP amount;
  final List<String> hotkeys;

  NeuronInfoForHW(
      {required this.id, required this.amount, required this.hotkeys});
}
