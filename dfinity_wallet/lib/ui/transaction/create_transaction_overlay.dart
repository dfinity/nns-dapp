import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_wallet_page.dart';

import '../../dfinity.dart';
import 'canister/select_cansiter_page.dart';

class NewTransactionOverlay extends StatefulWidget {
  late Widget rootWidget;
  late String rootTitle;

  NewTransactionOverlay({Key? key, required this.rootTitle, required this.rootWidget})
      : super(key: key);

  NewTransactionOverlay.account({Key? key, required Account account})
      : super(key: key){
    rootTitle = "Send ICPT";
    rootWidget =  SelectTransactionTypeWidget(
      source: account,
    );
  }

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

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
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
    );
  }

  MaterialPage createPage({String? title, required Widget widget}) => MaterialPage(
      child: Scaffold(
          backgroundColor: AppColors.lighterBackground,
          appBar: (title != null) ? AppBar(
            backgroundColor: AppColors.lighterBackground,
            toolbarHeight: 100,
            title: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Text(title,
                  style: TextStyle(
                      fontSize: 32,
                      fontFamily: Fonts.circularBook,
                      color: AppColors.gray100)),
            ),
          ) : null,
          body: widget));
}

class SelectTransactionTypeWidget extends StatelessWidget {
  final ICPSource source;

  const SelectTransactionTypeWidget({
    Key? key,
    required this.source,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(32),
              child: Text(
                "How would you like to use your ICP?",
                style: TextStyle(
                    fontSize: 32, fontFamily: Fonts.circularBook, color: AppColors.gray200),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: 400,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    buildButton(context, "Send", "Send ICP to another account", () {
                      NewTransactionOverlay.of(context).pushPage("Select Account", SelectDestinationAccountPage(
                        source: source,
                      ));
                    }),
                    SmallFormDivider(),
                    buildButton(context, "Convert", "Convert ICP into cycles to power canisters", () {}),
                    SmallFormDivider(),
                    buildButton(context, "Stake", "Stake ICP in a neuron to participate in governance", () {
                      NewTransactionOverlay.of(context).pushPage("Stake Neuron", StakeNeuronPage(source: source));
                    }),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  TextButton buildButton(BuildContext context, String title, String subtitle, Function() onPressed) {
    return TextButton(
            style: ButtonStyle(
              shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))),
              overlayColor: MaterialStateProperty.resolveWith((states) {
                if(states.contains(MaterialState.pressed)){
                  return AppColors.blue600;
                }else{
                  return AppColors.blue600;
                }
              })
            ),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: context.textTheme.headline3,
                    ),
                    SizedBox(height: 10,),
                    Text(
                      subtitle,
                      style: context.textTheme.bodyText2?.copyWith(color: AppColors.gray200),
                    ),
                  ],
                ),
              ),
            ),
            onPressed: onPressed,
          );
  }
}
