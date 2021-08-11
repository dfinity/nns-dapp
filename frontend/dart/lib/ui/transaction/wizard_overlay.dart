import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import '../../dfinity.dart';

class WizardOverlay extends StatefulWidget {
  late Widget rootWidget;
  late String rootTitle;

  WizardOverlay({Key? key, required this.rootTitle, required this.rootWidget})
      : super(key: key);

  static WizardOverlayState of(BuildContext context) =>
      context.findAncestorStateOfType<WizardOverlayState>()!;

  @override
  WizardOverlayState createState() => WizardOverlayState();
}

class WizardOverlayState extends State<WizardOverlay> {
  final GlobalKey navigatorKey = GlobalKey();

  List<MaterialPage> pages = [];

  @override
  void initState() {
    super.initState();
    pages.add(createPage(title: widget.rootTitle, widget: widget.rootWidget));
  }

  void pushPage(String? title, Widget widget) {
    setState(() {
      pages.add(createPage(title: title, widget: widget));
    });
  }

  void replacePage(String? title, Widget widget) {
    setState(() {
      pages.clear();
      pages.add(createPage(title: title, widget: widget));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      color: AppColors.transparent,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Navigator(
          key: navigatorKey,
          pages: List.of(pages),
          onPopPage: ((route, result) {
            final didPop = route.didPop(result);
            if (!didPop) {
              return false;
            }
            setState(() {
              pages.remove(route.settings);
            });
            return true;
          }),
        ),
      ),
    );
  }

  MaterialPage createPage({String? title, required Widget widget}) =>
      MaterialPage(
          child: Scaffold(
              backgroundColor: AppColors.lighterBackground,
              appBar: (title != null)
                  ? PreferredSize(
                      preferredSize: Size.fromHeight(60),
                      child: AppBar(
                        backgroundColor: AppColors.lighterBackground,
                        toolbarHeight: 80,
                        //leadingWidth: 100,
                        actions: [
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
                                        fontSize: 20,
                                        color: AppColors.white),
                                  ),
                                ),
                              )),
                        ],
                        title: AutoSizeText(title,
                            maxLines: 1,
                            overflow: TextOverflow.visible,
                            style: TextStyle(
                                fontSize: 25,
                                fontFamily: Fonts.circularBook,
                                color: AppColors.gray50)),
                      ),
                    )
                  : null,
              body: widget));
}
