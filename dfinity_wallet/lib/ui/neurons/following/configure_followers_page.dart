import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../../dfinity.dart';
import 'followee_suggestions.dart';

class ConfigureFollowersPage extends StatelessWidget {
  final Neuron neuron;

  const ConfigureFollowersPage({Key? key, required this.neuron})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.neurons.watch(key: neuron.id),
        builder: (context, snapshot) {
          final refreshed = context.boxes.neurons.get(neuron.id)!;
          final followees = refreshed.followees;
          return DefaultTabController(
            length: followees.length,
            child: Container(
              child: Column(
                children: [
                  Container(
                    color: AppColors.lighterBackground,
                    child: TabBar(
                        isScrollable: true,
                        indicatorColor: Colors.white,
                        tabs: [
                          ...followees.mapToList(
                            (e) => Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Tab(text: e.topic.description),
                            ),
                          )
                        ]),
                  ),
                  Expanded(
                    child: TabBarView(
                      children: [
                        ...followees.map((e) => TopicFolloweesWidget(
                              followees: e,
                              neuron: neuron,
                            ))
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        });
  }
}

class TopicFolloweesWidget extends StatelessWidget {
  final Neuron neuron;
  final Followee followees;

  const TopicFolloweesWidget(
      {Key? key,
      required this.neuron,
      required this.followees})
      : super(key: key);

  @override
  Widget build(BuildContext context) => SizedBox.expand(
        child: Container(
          color: AppColors.gray600,
          padding: EdgeInsets.symmetric(horizontal: 16.0),
          child: ListView(
            children: [
              SizedBox(height: 16,),
              Card(
                color: AppColors.background,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        followees.topic.description,
                        style: context.textTheme.headline3,
                        textAlign: TextAlign.left,
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text("This is a really important topic because it contains proposals that enable the network to grow and deliver value to the users for years to come in multiple aspects and dimensions.", style: context.textTheme.bodyText2,),
                      )
                    ],
                  ),
                ),
              ),
              SmallFormDivider(),
              currentlyFollowingCard(context),
              SmallFormDivider(),
              Card(
                color: AppColors.background,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Popular Neurons",
                        style: context.textTheme.headline3,
                        textAlign: TextAlign.left,
                      ),
                      FolloweeSuggestionWidget(followees.followees, suggestionSelected: (e) {
                        addFollower(e.id, context);
                      })
                    ],
                  ),
                ),
              ),
              SizedBox(height: 16,),
            ],
          ),
        ),
      );

  Card currentlyFollowingCard(BuildContext context) {
    return Card(
              color: AppColors.background,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Currently Following",
                      style: context.textTheme.headline3,
                    ),
                    followingTopicsList(context),
                    SmallFormDivider(),
                    ElevatedButton(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text("Enter Follower"),
                      ),
                      onPressed: () {
                        Overlay.of(context)?.show(
                            context,
                            Center(
                                child: ConstrainedBox(
                                    constraints: BoxConstraints(
                                        maxWidth: 400, maxHeight: 300),
                                    child: TextFieldDialogWidget(
                                        title: "Enter Neuron ID",
                                        buttonTitle: "Follow",
                                        fieldName: "Neuron ID",
                                        onComplete: (id) {
                                          addFollower(id, context);
                                        }))));
                      },
                    ),
                  ],
                ),
              ),
            );
  }

  Widget followingTopicsList(BuildContext context) {
    return Column(
      children: [
        ...followees.followees.mapIndexed((i, e) => Container(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    Expanded(child: Text(e, style: context.textTheme.bodyText2),),
                    if (i != 0) TextButton(onPressed: () {
                      reorder(context, i, i-1);
                    }, child: Text('↑')),
                    if (i != followees.followees.lastIndex)
                      TextButton(onPressed: () {
                        reorder(context, i, i+1);
                      }, child: Text('↓')),
                    TextButton(onPressed: () {
                      removeFollower(e, context);
                    }, child: Text('✕'))
                  ],
                ),
              ),
            ))
      ],
    );
  }

  void reorder(BuildContext context, int oldIndex, int newIndex) {
    followees.followees.swap(oldIndex, newIndex);
    saveChanges(context);
  }

  void addFollower(String id, BuildContext context) {
    followees.followees.add(id);
    saveChanges(context);
  }

  void removeFollower(String id, BuildContext context) {
    followees.followees.remove(id);
    saveChanges(context);
  }

  void saveChanges(BuildContext context) {
    neuron.save();
    context.icApi.follow(
        neuronId: neuron.id.toBigInt,
        topic: followees.topic,
        followees: followees.followees.mapToList((e) => e.toBigInt));
  }
}
