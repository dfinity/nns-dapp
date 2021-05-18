import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/topic_card.dart';
import 'package:dfinity_wallet/ui/neurons/following/topic_followeees_widget.dart';

import '../../../dfinity.dart';

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
        stream: context.boxes.neurons.changes,
        builder: (context, snapshot) {
          final refreshed = context.boxes.neurons[widget.neuron.id];
          final followees = refreshed.followees;
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
                          child: Text("Follow neurons to automate your voting, and receive the maximum voting rewards. You can follow neurons on specific topics or all topics.", style: context.textTheme.subtitle2),
                        ),
                        SmallFormDivider(),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: ExpansionPanelList(
                            key: contentKey,
                            elevation: 0,
                            animationDuration: 0.5.seconds,                            
                            expansionCallback: (i, expanded) {
                              setState(() {
                                if (expanded) {
                                  expandedIndex = null;
                                } else {
                                  expandedIndex = i;
                                }
                              });
                            },
                            children: [
                              ...followees.mapIndexed((i, e) {
                                return ExpansionPanel(
                                    canTapOnHeader: true,
                                    isExpanded: i == expandedIndex,
                                    backgroundColor: AppColors.lightBackground,
                                    headerBuilder: (context, expanded) => TopicCard(followees: e, key: rowKeys[i]),
                                    body: TopicFolloweesWidget(followees: e, neuron: widget.neuron)
                                  );
                              }),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }
      );
  }
}