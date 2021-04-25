
import '../../../dfinity.dart';
import '../../../data/topic.dart';

class TopicCard extends StatelessWidget {
  final Followee followees;

  const TopicCard({Key? key, required this.followees}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  followees.topic.name,
                  style: context.textTheme.headline3,
                  textAlign: TextAlign.left,
                ),
                SizedBox(
                  height: 5,
                ),
                Text(
                  followees.topic.desc,
                  style: context.textTheme.subtitle2,
                )
              ],
            ),
          ),
          SizedBox(
            width: 10,
          ),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: AppColors.gray50),
            child: Center(
              child: RichText(
                text: TextSpan(
                  text: "${followees.followees.length}",
                  style: context.textTheme.headline3
                      ?.copyWith(color: AppColors.background),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}

