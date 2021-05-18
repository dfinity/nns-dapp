import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/data/proposal_reward_status.dart';
import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/multi_select_list.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/neuron_info/neuron_info_widget.dart';

class GovernanceTabWidget extends StatefulWidget {
  @override
  _GovernanceTabWidgetState createState() => _GovernanceTabWidgetState();
}

final DefaultTopics = [
  Topic.NeuronManagement,
  Topic.NetworkEconomics,
  Topic.Governance,
  Topic.NodeAdmin,
  Topic.ParticipantManagement,
  Topic.SubnetManagement,
  Topic.NetworkCanisterManagement,
];

final ValidTopics = [
  Topic.NeuronManagement,
  Topic.ExchangeRate,
  Topic.NetworkEconomics,
  Topic.Governance,
  Topic.NodeAdmin,
  Topic.ParticipantManagement,
  Topic.SubnetManagement,
  Topic.NetworkCanisterManagement,
  Topic.Kyc,
];

final ValidStatuses = [
  ProposalStatus.Open,
  ProposalStatus.Rejected,
  ProposalStatus.Accepted,
  ProposalStatus.Executed,
  ProposalStatus.Failed,
];

final DefaultStatuses = [
  ProposalStatus.Open,
  ProposalStatus.Rejected,
  ProposalStatus.Accepted,
  ProposalStatus.Executed,
];

final ValidRewardStatuses = [
  ProposalRewardStatus.AcceptVotes,
  ProposalRewardStatus.ReadyToSettle,
  ProposalRewardStatus.Settled,
  ProposalRewardStatus.Ineligible,
];

final DefaultRewardStatuses = [
  ProposalRewardStatus.AcceptVotes,
  ProposalRewardStatus.ReadyToSettle,
  ProposalRewardStatus.Settled,
  ProposalRewardStatus.Ineligible,
];

class _GovernanceTabWidgetState extends State<GovernanceTabWidget> {
  MultiSelectField<Topic> topicsField = MultiSelectField<Topic>(
      "Topics",
      ValidTopics,
      DefaultTopics,
      (dynamic e) => (e as Topic?)?.name ?? "");

  MultiSelectField<ProposalStatus> statusesField =
      MultiSelectField<ProposalStatus>(
          "Proposal Status",
          ValidStatuses,
          DefaultStatuses,
          (dynamic e) => (e as ProposalStatus?)?.description ?? "");

  MultiSelectField<ProposalRewardStatus> rewardStatuesField =
      MultiSelectField<ProposalRewardStatus>(
          "Reward Status",
          ValidRewardStatuses,
          DefaultRewardStatuses,
          (dynamic e) => (e as ProposalRewardStatus?)?.label ?? "");

  bool excludeVotedProposals = false;

  @override
  void initState() {
    super.initState();
    0.1.seconds.delay.then((value) => fetchProposals());
  }

  void fetchProposals({Proposal? lastProposal}) {
    if (mounted) {
      context.icApi.fetchProposals(
        excludeTopics: Topic
          .values
          .filterNot((element) => topicsField.selectedOptions.contains(element))
          .toList(),
        includeStatus: statusesField.selectedOptions,
        includeRewardStatus: rewardStatuesField.selectedOptions,
        beforeProposal: lastProposal);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FooterGradientButton(
      footer: Container(),
      body: ConstrainWidthAndCenter(
        child: TabTitleAndContent(
          title: "Voting",
          subtitle: "The Internet Computer network runs under the control of the Network Nervous System, which adopts proposals and automatically executes corresponding actions. Anyone can submit a proposal, which are decided as the result of voting activity by neurons.",
          children: [
            IntrinsicHeight(
              child: MultiSelectDropdownWidget(
                topicsField,
                onChange: () {
                  setState(() {});
                },
                onDismiss: () {
                  fetchProposals();
                },
              ),
            ),
            SizedBox(height: 10),
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: MultiSelectDropdownWidget(
                      rewardStatuesField,
                      onChange: () {
                        setState(() {});
                      },
                      onDismiss: () {
                        fetchProposals();
                      },
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: MultiSelectDropdownWidget(
                      statusesField,
                      onChange: () {
                        setState(() {});
                      },
                      onDismiss: () {
                        fetchProposals();
                      },
                    ),
                  )
                ],
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Flexible(
                  child: Text(
                    "Hide \“Open\” proposals where all your neurons have voted or are ineligible to vote",
                    softWrap: true,
                  ),
                ),
                Container(
                  margin: const EdgeInsets.only(left: 6),
                  child: Checkbox(
                    value: excludeVotedProposals, 
                    onChanged: (bool? value) { 
                      setState(() {
                        excludeVotedProposals = value!;
                      }); 
                    },
                  )
                ),
              ],
            ),
            SizedBox(height: 4),
            StreamBuilder<Object>(
                stream: context.boxes.proposals.changes,
                builder: (context, snapshot) {
                  final proposals = context.boxes.proposals.values
                    .filter((proposal) => topicsField.selectedOptions.contains(proposal.topic))
                    .filter((proposal) => statusesField.selectedOptions.contains(proposal.status))
                    .filter((proposal) => rewardStatuesField.selectedOptions.contains(proposal.rewardStatus))
                    .filter((proposal) => !excludeVotedProposals || proposal.status != ProposalStatus.Open || proposal.ballots.values.any((ballot) => ballot.vote == Vote.UNSPECIFIED))
                    .sortedByDescending((element) => element.proposalTimestamp);

                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ...proposals.mapToList((e) => ProposalRow(
                          proposal: e,
                          onPressed: () {
                            context.nav.push(ProposalPageDef.createPageConfig(e));
                          },
                        )
                      ),
                      SmallFormDivider(),
                      Center(
                        child: TextButton(
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                              "Load More Proposals",
                              style: context.textTheme.subtitle2?.copyWith(color: AppColors.gray100),
                            ),
                          ),
                          onPressed: () {
                            final lastProposal = proposals.lastOrNull;
                            fetchProposals(lastProposal: lastProposal);
                          }),
                      ),
                      SizedBox(height: 200,)
                    ],
                  );
                }
             ),
          ],
        ),
      ),
    );
  }
}

class ProposalRow extends StatelessWidget {
  final Proposal proposal;
  final VoidCallback onPressed;

  const ProposalRow({Key? key, required this.proposal, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10),
      color: AppColors.background,
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(10, 18, 10, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded (
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        proposal.summary,
                        style: context.textTheme.subtitle1,
                      ),
                      TextButton(
                        onPressed: () {
                          OverlayBaseWidget.show(context, NeuronInfoWidget(proposal.proposer));
                        },
                        child: Text("Proposer: ${proposal.proposer}", style: context.textTheme.bodyText2)
                      ),
                      Text(
                        "Id: ${proposal.id}",
                        style: context.textTheme.bodyText2,
                      ),
                    ],
                  ),
                ),
                Container(
                  margin: const EdgeInsets.only(left: 16),
                  decoration: ShapeDecoration(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(width: 2, color: proposal.status.color)
                        )
                      ),
                  child: Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      proposal.status.description,
                      style: TextStyle(
                          fontSize: 24,
                          fontFamily: Fonts.circularBook,
                          color: proposal.status.color,
                          fontWeight: FontWeight.normal),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
