import 'package:core/core.dart';
import 'package:nns_dapp/data/topic.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/following/topic_card.dart';
import 'package:nns_dapp/ui/neurons/following/topic_followeees_widget.dart';
import '../../../nns_dapp.dart';

class ConfigureFollowersPage extends StatefulWidget {
  final Neuron neuron;
  final Function(BuildContext) completeAction;

  const ConfigureFollowersPage(
      {Key? key, required this.neuron, required this.completeAction})
      : super(key: key);

  @override
  _ConfigureFollowersPageState createState() => _ConfigureFollowersPageState();
}

class _ConfigureFollowersPageState extends State<ConfigureFollowersPage> {
  int? expandedIndex;
  ScrollController scrollController = ScrollController();

  late List<GlobalKey> rowKeys;

  bool pressed = false;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.neurons.changes,
        builder: (context, snapshot) {
          final refreshed = context.boxes.neurons[widget.neuron.id];
          // NeuronManagement proposals are not public so we hide this topic
          // (unless the neuron already has followees on this topic)
          final followees = refreshed.followees
              .where((e) => (e.topic != Topic.NeuronManagement) || e.followees.isNotEmpty);
          rowKeys = followees.map((element) => GlobalKey()).toList();
          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(
                              "Follow neurons to automate your voting, and receive the maximum voting rewards. You can follow neurons on specific topics or all topics.",
                              style: context.textTheme.subtitle2),
                        ),
                        SmallFormDivider(),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: Container(
                            color: AppColors.lightBackground,
                            padding: EdgeInsets.only(left: 0.0, top: 20.0),
                            child: Column(
                              children: [
                                ...followees.mapIndexed((i, e) {
                                  return ExpansionTile(
                                    backgroundColor: AppColors.lightBackground,
                                    onExpansionChanged: (isExpanded) {
                                      setState(() {
                                        pressed = isExpanded;
                                      });
                                    },
                                    title: TopicCardName(followees: e),
                                    subtitle:
                                        TopicCardDescription(followees: e),
                                    children: [
                                      TopicFolloweesWidget(
                                          followees: e, neuron: widget.neuron),
                                    ],
                                    trailing: Wrap(
                                      children: [
                                        SizedBox(
                                            width: Responsive.isMobile(context)
                                                ? 10.0
                                                : 20.0),
                                        TopicCardFolloweesLength(followees: e),
                                        SizedBox(
                                            width: Responsive.isMobile(context)
                                                ? 10.0
                                                : 20.0),
                                        pressed
                                            ? Icon(
                                                Icons.keyboard_arrow_up,
                                                size:
                                                    Responsive.isMobile(context)
                                                        ? 25
                                                        : 40,
                                                color: AppColors.black,
                                              )
                                            : Icon(
                                                Icons.keyboard_arrow_down,
                                                size:
                                                    Responsive.isMobile(context)
                                                        ? 25
                                                        : 40,
                                                color: AppColors.black,
                                              )
                                      ],
                                    ),
                                  );
                                }),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        });
  }
}
