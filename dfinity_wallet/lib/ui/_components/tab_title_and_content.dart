
import '../../dfinity.dart';

class TabTitleAndContent extends StatelessWidget {
    final String title;
    final String? subtitle;
    final Widget content;

    const TabTitleAndContent({Key? key, required this.title, this.subtitle, required this.content}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Container(
            color: AppColors.gray1000,
            child: Center(
                    child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 800),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                              Padding(
                                  padding: const EdgeInsets.only(top: 48.0, left: 24.0, bottom: 24.0),
                                  child: Text(title, style: context.textTheme.headline1),
                              ),
                              if(subtitle!= null)
                                  Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Text(subtitle!, style: context.textTheme.headline2,),
                                  ),
                              Expanded(child: content)
                          ],
                      ),
                    )),
        );
    }
}
