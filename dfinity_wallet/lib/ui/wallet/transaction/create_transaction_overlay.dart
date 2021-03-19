import 'package:dfinity_wallet/ui/wallet/transaction/topup_canister_page.dart';

import '../../../dfinity.dart';

class NewTransactionOverlay extends StatefulWidget {
  final Wallet wallet;

  const NewTransactionOverlay({Key? key, required this.wallet})
      : super(key: key);

  @override
  _NewTransactionOverlayState createState() => _NewTransactionOverlayState();
}

class _NewTransactionOverlayState extends State<NewTransactionOverlay> {
  final GlobalKey navigatorKey = GlobalKey();

  List<MaterialPage> pages = [];

  @override
  void initState() {
    super.initState();
    pages.add(createPage(
        key: ValueKey("Home"),
        widget: SelectTransactionTypeWidget(
            wallet: widget.wallet,
            onTypeSelected: (e) {
              setState(() {
                pages.add(
                    createPage(
                        key: ValueKey("Next"),
                        widget: e));
              });
            })));
  }

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: Card(
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

  MaterialPage createPage({required Widget widget, required ValueKey key}) =>
      MaterialPage(
          key: key,
          child: Scaffold(
              appBar: AppBar(
                title: Text("New Transaction"),
              ),
              backgroundColor: AppColors.background,
              body: widget));
}

class SelectTransactionTypeWidget extends StatelessWidget {
  final Function(Widget) onTypeSelected;
  final Wallet wallet;

  const SelectTransactionTypeWidget({
    Key? key,
    required this.wallet,
    required this.onTypeSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ListTile(
            title: Text(
              "Where would you like to send the ICP?",
              style: context.textTheme.headline3,
            ),
          ),
          ListTile(
            title: Text(
              "A Canister, as cycles",
              style: context.textTheme.bodyText2,
            ),
            onTap: () {
              onTypeSelected(TopUpCanisterPage(wallet: wallet));
            },
          ),
          ListTile(
            title: Text(
              "Send to a Wallet",
              style: context.textTheme.bodyText2,
            ),
          ),
          ListTile(
            title: Text(
              "Stake a Neuron",
              style: context.textTheme.bodyText2,
            ),
          )
        ],
      ),
    );
  }
}
