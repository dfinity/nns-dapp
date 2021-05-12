import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
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
  Widget build(BuildContext context) =>
      Container(
        padding: EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
        child: IntrinsicHeight(
          child: currentlyFollowingCard(context),
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
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  style: ButtonStyle(backgroundColor: MaterialStateProperty.all(
                      AppColors.gray800)),
                  child: Padding(
                    padding: EdgeInsets.all(8),
                    child: Text("Add Follow"),
                  ),
                  onPressed: () {
                    OverlayBaseWidget.show(
                        context,
                        EnterFolloweeWidget(

                            followees: followees,
                            neuron: neuron,
                            onComplete: (id) {
                              addFollower(id, context);
                            }));
                  },
                ),
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
        ...followees.followees.mapIndexed((i, e) =>
            Container(
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
    followees.followees = followees.followees.toList()
      ..add(id);
    saveChanges(context);
  }

  void removeFollower(String id, BuildContext context) {
    followees.followees = followees.followees.toList()
      ..remove(id);
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


class EnterFolloweeWidget extends StatelessWidget {
  EnterFolloweeWidget(
      {Key? key, required this.neuron, required this.followees, required this.onComplete})
      : super(key: key);

  final ValidatedTextField addressField = ValidatedTextField(
      "Followee Address", inputType: TextInputType.number, validations: []);

  final Function(String neuronId) onComplete;
  final Neuron neuron;
  final Followee followees;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Container(
            height: 64,
            decoration: BoxDecoration(
                color: AppColors.gray800,
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24))),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Container(
                    width: 24,
                  ),
                  Center(
                      child: Text("Enter New Followee",
                          style: TextStyle(
                              fontFamily: Fonts.circularBook,
                              fontSize: 24,
                              color: AppColors.white))),
                  Expanded(child: Container()),
                  AspectRatio(
                      aspectRatio: 1,
                      child: TextButton(
                        onPressed: () {
                          OverlayBaseWidget.of(context)?.dismiss();
                        },
                        child: Center(
                          child: Text(
                            "✕",
                            style: TextStyle(
                                fontFamily: Fonts.circularBook,
                                fontSize: 24,
                                color: AppColors.white),
                          ),
                        ),
                      )),
                ],
              ),
            ),
          ),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Neuron ID",
                      style: context.textTheme.headline3),
                  DebouncedValidatedFormField(addressField),
                  Center(
                    child: ValidFieldsSubmitButton(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text("Follow Neuron"),
                      ),
                      onPressed: () async {
                        onComplete(addressField.currentValue);
                        OverlayBaseWidget.of(context)?.dismiss();
                      },
                      fields: [addressField],
                    ),
                  )
                ],
              ),
            ),
          ),
          SmallFormDivider(),
          Card(
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
                        onComplete(e.id);
                        OverlayBaseWidget.of(context)?.dismiss();
                      })
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

}
