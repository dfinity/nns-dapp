import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/neurons/following/configure_followers_page.dart';

import '../../../dfinity.dart';


class NeuronFolloweesCard extends StatelessWidget {

  final Neuron neuron;

  const NeuronFolloweesCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                  child: Text("Following",
                      style: context.textTheme.headline3),
                ),
              ],
            ),
            ...neuron.followees.filter((element) => element.followees.isNotEmpty).map((e) => Container(
              padding: EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e.topic.toString(), style: context.textTheme.headline4,),
                    Text(e.followees.joinToString(), style: context.textTheme.bodyText1),
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
                  Overlay.of(context)?.show(context,
                      ConfigureFollowersPage(
                        neuron: neuron,
                      )
                  );
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
