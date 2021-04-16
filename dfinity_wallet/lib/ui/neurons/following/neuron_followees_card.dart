import 'package:dfinity_wallet/data/topic.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
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
        .entries;

    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text("Following", style: context.textTheme.headline3),
                ),
              ],
            ),
            ...followeeTopics
                .map((e) => Container(
                      padding: EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            e.key.toString(),
                            style: context.textTheme.headline4,
                          ),
                          Row(
                            children: e.value.mapToList((topic) => Padding(
                              padding: EdgeInsets.only(top:8.0, bottom: 8.0, left: 4.0),
                              child: Container(
                                decoration: ShapeDecoration(
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        side: BorderSide(width: 2, color: Color(0xffFBB03B)))),
                                child: Padding(
                                  padding: EdgeInsets.all(4.0),
                                  child: Text(
                                    topic.topic.name,
                                    style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: Fonts.circularBook,
                                        color: Color(0xffFBB03B),
                                        fontWeight: FontWeight.normal),
                                  ),
                                ),
                              ),
                            )),
                          )
                        ],
                      ),
                    )),
            SmallFormDivider(),
            ElevatedButton(
                style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all(AppColors.blue600),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)))),
                onPressed: () {
                  Overlay.of(context)?.show(
                      context,
                      ConfigureFollowersPage(
                        neuron: neuron,
                      ));
                },
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text("Edit Followees"),
                ))
          ],
        ),
      ),
    );
  }
}
