import 'package:dfinity_wallet/ui/_components/responsive.dart';

import '../../dfinity.dart';

class TabTitleAndContent extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget> children;

  const TabTitleAndContent({
    Key? key,
    required this.title,
    this.subtitle,
    required this.children,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 800),
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.max,
          children: [
            Padding(
              padding:
                  const EdgeInsets.only(top: 24.0, left: 20.0, bottom: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Responsive.isDesktop(context) |
                            Responsive.isTablet(context)
                        // ? TextStyle(fontSize: 50)
                        // : TextStyle(fontSize: 25)
                        ? context.textTheme.headline2
                        : context.textTheme.headline6,
                  ),
                  if (subtitle != null) ...[
                    SizedBox(
                      height: 10,
                    ),
                    SelectableText(
                      subtitle!,
                      style: Responsive.isDesktop(context) |
                              Responsive.isTablet(context)
                          ? context
                              .textTheme.subtitle1 //context.textTheme.headline2
                          : context.textTheme.subtitle2,
                    )
                  ]
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
