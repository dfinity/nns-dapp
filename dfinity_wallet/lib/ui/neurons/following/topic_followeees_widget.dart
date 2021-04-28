import 'package:dfinity_wallet/ui/neuron_info/neuron_info_widget.dart';

import '../../../dfinity.dart';
import 'followee_suggestions.dart';

class TopicFolloweesWidget extends StatelessWidget {
  final Neuron neuron;
  final Followee followees;

  const TopicFolloweesWidget(
      {Key? key, required this.neuron, required this.followees})
      : super(key: key);

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: currentlyFollowingCard(context)),
              SizedBox(
                width: 10,
              ),
              Expanded(
                child: Container(
                  color: AppColors.background,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "Options for Following",
                          style: context.textTheme.headline3,
                          textAlign: TextAlign.left,
                        ),
                        FolloweeSuggestionWidget(followees.followees,
                            suggestionSelected: (e) {
                          addFollower(e.id, context);
                        })
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );

  Container currentlyFollowingCard(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Currently Following",
              style: context.textTheme.headline3,
            ),
            Expanded(child: followingTopicsList(context)),
            Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                child: Padding(
                  padding: EdgeInsets.all(8),
                  child: Text("Enter Followee"),
                ),
                onPressed: () {
                  OverlayBaseWidget.show(
                      context,
                      TextFieldDialogWidget(
                          title: "Enter Neuron ID",
                          buttonTitle: "Follow",
                          fieldName: "Neuron ID",
                          onComplete: (id) {
                            addFollower(id, context);
                          }));
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget followingTopicsList(BuildContext context) {
    final buttonStyle = ButtonStyle(
        foregroundColor: MaterialStateProperty.all(AppColors.white),
        minimumSize: MaterialStateProperty.all(Size.square(40)));
    return Column(
      children: [
        ...followees.followees.mapIndexed((i, e) => Container(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                              FolloweeSuggestion.followerSuggestions
                                      .firstOrNullWhere(
                                          (element) => element.id == e)
                                      ?.name ??
                                  e,
                              style: context.textTheme.bodyText2),
                        ),
                        onPressed: () {
                          OverlayBaseWidget.show(context, NeuronInfoWidget(e));
                        },
                      ),
                    ),
                    if (i != 0)
                      TextButton(
                          style: buttonStyle,
                          onPressed: () {
                            reorder(context, i, i - 1);
                          },
                          child: Text('↑')),
                    if (i != followees.followees.lastIndex)
                      TextButton(
                          style: buttonStyle,
                          onPressed: () {
                            reorder(context, i, i + 1);
                          },
                          child: Text('↓')),
                    TextButton(
                        style: buttonStyle,
                        onPressed: () {
                          removeFollower(e, context);
                        },
                        child: Text('✕'))
                  ],
                ),
              ),
            ))
      ],
    );
  }

  void reorder(BuildContext context, int oldIndex, int newIndex) {
    followees.followees = followees.followees.toList()
      ..swap(oldIndex, newIndex);
    saveChanges(context);
  }

  void addFollower(String id, BuildContext context) {
    followees.followees = followees.followees.toList()..add(id);
    saveChanges(context);
  }

  void removeFollower(String id, BuildContext context) {
    followees.followees = followees.followees.toList()..remove(id);
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
