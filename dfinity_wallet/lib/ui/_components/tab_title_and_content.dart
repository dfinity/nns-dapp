
import '../../dfinity.dart';

class TabTitleAndContent extends StatelessWidget {
    final String title;
    final String? subtitle;
    final List<Widget> children;

    const TabTitleAndContent({Key? key, required this.title, this.subtitle, required this.children}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return Container(
            color: AppColors.gray600,
            child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 800),
              child: SingleChildScrollView(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.max  ,
                    children: [
                        Padding(
                            padding: const EdgeInsets.only(top: 24.0, left: 24.0, bottom: 24.0),
                            child: Text(title, style: context.textTheme.headline1),
                        ),
                        if(subtitle!= null)
                            Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Text(subtitle!, style: context.textTheme.headline2,),
                            ),
                        ...children
                    ],
                ),
              ),
            ),
        );
    }
}
