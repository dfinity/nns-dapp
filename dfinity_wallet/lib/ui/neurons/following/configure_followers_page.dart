import 'dart:math';

import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/topic_card.dart';
import 'package:dfinity_wallet/ui/neurons/following/topic_followeees_widget.dart';

import '../../../dfinity.dart';
import 'followee_suggestions.dart';

class ConfigureFollowersPage extends StatefulWidget {
  final Neuron neuron;
  final Function(BuildContext) completeAction;

  const ConfigureFollowersPage({Key? key, required this.neuron, required this.completeAction})
      : super(key: key);

  @override
  _ConfigureFollowersPageState createState() => _ConfigureFollowersPageState();
}

class _ConfigureFollowersPageState extends State<ConfigureFollowersPage> {
  int? expandedIndex;
  GlobalKey contentKey = GlobalKey();
  ScrollController scrollController = ScrollController();

  late List<GlobalKey> rowKeys;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.neurons.watch(key: widget.neuron.id),
        builder: (context, snapshot) {
          final refreshed = context.boxes.neurons.get(widget.neuron.id)!;
          final followees = refreshed.followees
              .filterNot((element) => element.topic == Topic.Unspecified)
              .toList();
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
                            "Follow Topics",
                            style: context.textTheme.headline2,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text("Follow neurons to automate your voting, and receive the maximum voting rewards", style: context.textTheme.subtitle2),
                        ),
                        SmallFormDivider(),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: ExpansionPanelList(
                            key: contentKey,
                            elevation: 0,
                            animationDuration: 1.seconds,
                            expansionCallback: (i, expanded) {
                              setState(() {
                                if (expanded) {
                                  expandedIndex = null;
                                } else {
                                  expandedIndex = i;
                                }
                                animateToCurrentStep();
                              });
                            },
                            children: [
                              ...followees.mapIndexed((i, e) {
                                return ExpansionPanel(
                                    canTapOnHeader: true,
                                    isExpanded: i == expandedIndex,
                                    backgroundColor: AppColors.lightBackground,
                                    headerBuilder: (context, expanded) =>
                                        TopicCard(followees: e, key: rowKeys[i]),
                                    body: TopicFolloweesWidget(
                                        followees: e, neuron: widget.neuron));
                              }),
                            ],
                          ),
                        ),
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(42.0),
                            child: ElevatedButton(
                              onPressed: () {
                                widget.completeAction(context);
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text(
                                  "Save and Close",
                                  style: TextStyle(
                                      fontFamily: Fonts.circularBook,
                                      fontSize: 24,
                                      color: AppColors.white),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Container(
                          height: MediaQuery.of(context).size.height.half,
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

  void animateToCurrentStep() async {
    await 0.05.seconds.delay;
    if (contentKey.attached && expandedIndex != null) {
      final contentHeight = contentKey.currentContext!.size!.height;
      final maxOffset = contentHeight;

      final proposedOffset = rowKeys
              .take(expandedIndex!)
              .sumBy((element) => element.frame.height) +
          100;

      final newOffset = min(maxOffset, proposedOffset);
      scrollController.animateTo(newOffset,
          duration: 1.seconds, curve: Curves.easeInOut);
    }
  }
}
