import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/select_transaction_type_widget.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';

import '../../dfinity.dart';
import 'canister/select_cansiter_page.dart';

class NewTransactionOverlay extends StatefulWidget {
  late Widget rootWidget;
  late String rootTitle;

  NewTransactionOverlay({Key? key, required this.rootTitle, required this.rootWidget})
      : super(key: key);


  static NewTransactionOverlayState of(BuildContext context) =>
      context.findAncestorStateOfType<NewTransactionOverlayState>()!;

  @override
  NewTransactionOverlayState createState() => NewTransactionOverlayState();
}


class NewTransactionOverlayState extends State<NewTransactionOverlay> {
  final GlobalKey navigatorKey = GlobalKey();

  List<MaterialPage> pages = [];

  @override
  void initState() {
    super.initState();
    pages.add(createPage(title: widget.rootTitle, widget:widget.rootWidget));
  }

  void pushPage(String? title, Widget widget) {
    setState(() {
      pages.add(createPage(title:title, widget: widget));
    });
  }

  void replacePage(String? title, Widget widget) {
    setState(() {
      pages.clear();
      pages.add(createPage(title:title, widget: widget));
    });
  }


  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      color: AppColors.transparent,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
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

  MaterialPage createPage({String? title, required Widget widget}) => MaterialPage(
      child: Scaffold(
          backgroundColor: AppColors.lighterBackground,
          appBar: (title != null) ? AppBar(
            backgroundColor: AppColors.lighterBackground,
            toolbarHeight: 100,
            leadingWidth: 100,
            actions: [AspectRatio(
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
                          fontSize: 24,
                          color: AppColors.white),
                    ),
                  ),
                )),],
            title: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Text(title,
                  style: TextStyle(
                      fontSize: 32,
                      fontFamily: Fonts.circularBook,
                      color: AppColors.gray50)),
            ),
          ) : null,
          body: widget));
}


