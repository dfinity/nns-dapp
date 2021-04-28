import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neuron_info/neuron_info_widget.dart';
import 'package:dfinity_wallet/ui/neurons/following/configure_followers_page.dart';

import '../../../dfinity.dart';

class TopicFollowee {
  final String neuron;
  final Topic topic;

  TopicFollowee(this.neuron, this.topic);
}

class NeuronFolloweesCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronFolloweesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final followeeTopics = neuron.followees
        .flatMap((followee) =>
            followee.followees.map((e) => TopicFollowee(e, followee.topic)))
        .groupBy((element) => element.neuron)
        .entries
        .toList();

    return Card(
      color: AppColors.background,
      child: Container(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Following", style: context.textTheme.headline3),
            Padding(
              padding: const EdgeInsets.only(top: 5.0, right: 50),
              child: Text(
                  "Following allows you to delegate your votes to another neuron holder. You still earn rewards if you delegate your voting rights. You can change your following at any time.",
                  style: context.textTheme.subtitle2),
            ),
            VerySmallFormDivider(),
            Container(
              padding: const EdgeInsets.all(8.0),
              width: double.infinity,
              decoration: RoundedBorderDecoration,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: followeeTopics
                    .map((e) => Container(
                          padding: EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TextButton(
                                onPressed: () {
                                  showNeuronInfo(context, e.key);
                                },
                                child: SelectableText(
                                  e.key.toString(),
                                  style: TextStyle(
                                      fontSize: 16,
                                      fontFamily: Fonts.circularBold,
                                      color: AppColors.white,
                                      fontWeight: FontWeight.w700,
                                      decoration: TextDecoration.underline
                                  ),
                                  onTap: () {
                                    showNeuronInfo(context, e.key);
                                  },
                                ),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 4.0),
                                child: Wrap(
                                  children: e.value.mapToList((topic) =>
                                      Padding(
                                        padding: EdgeInsets.only(
                                            top: 4.0, left: 4.0),
                                        child: Container(
                                          decoration: ShapeDecoration(
                                              shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  side: BorderSide(
                                                      width: 2,
                                                      color:
                                                          Color(0xffFBB03B)))),
                                          child: Padding(
                                            padding: EdgeInsets.all(4.0),
                                            child: Text(
                                              topic.topic.name,
                                              style: TextStyle(
                                                  fontSize: 14,
                                                  fontFamily:
                                                      Fonts.circularBook,
                                                  color: Color(0xffFBB03B),
                                                  fontWeight:
                                                      FontWeight.normal),
                                            ),
                                          ),
                                        ),
                                      )),
                                ),
                              )
                            ],
                          ),
                        ))
                    .interspace(Divider(
                      height: 2,
                      color: AppColors.gray500,
                    ))
                    .toList(),
              ),
            ),
            SmallFormDivider(),
            Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                  onPressed: () {
                    OverlayBaseWidget.show(
                        context,
                        ConfigureFollowersPage(
                          neuron: neuron,
                          completeAction: (context) {
                            OverlayBaseWidget.of(context)?.dismiss();
                          },
                        ),
                        maxSize: Size(
                            700, MediaQuery.of(context).size.height - 100));
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Text(followeeTopics.isEmpty
                        ? "Follow Neurons"
                        : "Edit Followees"),
                  )),
            )
          ],
        ),
      ),
    );
  }

  void showNeuronInfo(BuildContext context, String neuronId) {
    OverlayBaseWidget.show(context, NeuronInfoWidget(neuronId));
  }
}
