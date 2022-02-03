import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../../nns_dapp.dart';
import '../../../data/topic.dart';

class TopicCardName extends StatelessWidget {
  final Followee followees;
  const TopicCardName({required this.followees});

  @override
  Widget build(BuildContext context) {
    return Text(
      followees.topic.name,
      style: context.textTheme.headline3,
      textAlign: TextAlign.left,
    );
  }
}

class TopicCardDescription extends StatelessWidget {
  final Followee followees;
  const TopicCardDescription({required this.followees});

  @override
  Widget build(BuildContext context) {
    return Text(
      followees.topic.desc,
      style: context.textTheme.subtitle2,
    );
  }
}

class TopicCardFolloweesLength extends StatelessWidget {
  final Followee followees;
  const TopicCardFolloweesLength({required this.followees});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: Responsive.isMobile(context) ? 25 : 40,
      height: Responsive.isMobile(context) ? 25 : 40,
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20), color: AppColors.gray50),
      child: Center(
        child: RichText(
          text: TextSpan(
            text: "${followees.followees.length}",
            style: Responsive.isMobile(context)
                ? context.textTheme.headline4
                    ?.copyWith(color: AppColors.background)
                : context.textTheme.headline3
                    ?.copyWith(color: AppColors.background),
          ),
        ),
      ),
    );
  }
}
