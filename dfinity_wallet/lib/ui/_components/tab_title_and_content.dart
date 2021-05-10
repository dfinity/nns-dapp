import '../../dfinity.dart';

class TabTitleAndContent extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget> children;

  const TabTitleAndContent(
      {Key? key, required this.title, this.subtitle, required this.children})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 800),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.max,
          children: [
            Padding(
              padding:
                  const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: context.textTheme.headline1),
                  if (subtitle != null)
                    ...[
                      SizedBox(height: 10,),
                      SelectableText(
                      subtitle!,
                      style: context.textTheme.subtitle2,
                    )]
                ],
              ),
            ),
            ...children
          ],
        ),
      ),
    );
  }
}
