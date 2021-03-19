import 'package:dfinity_wallet/ui/wallet/transaction/canister/select_cansiter_page.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/stake_neuron_page.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/canister/topup_canister_page.dart';
import 'package:dfinity_wallet/ui/wallet/transaction/wallet/select_wallet_page.dart';

import '../../../dfinity.dart';

class NewTransactionOverlay extends StatefulWidget {
  final Wallet wallet;

  const NewTransactionOverlay({Key? key, required this.wallet})
      : super(key: key);

  static NewTransactionOverlayState of(BuildContext context) => context.findAncestorStateOfType<NewTransactionOverlayState>()!;

  @override
  NewTransactionOverlayState createState() => NewTransactionOverlayState();
}

class NewTransactionOverlayState extends State<NewTransactionOverlay> {
  final GlobalKey navigatorKey = GlobalKey();

  List<MaterialPage> pages = [];

  @override
  void initState() {
    super.initState();
    pages.add(createPage(
        widget: SelectTransactionTypeWidget(
            wallet: widget.wallet,
        )));
  }

  void pushPage(Widget widget){
    setState(() {
      pages.add(
          createPage(
              widget: widget));
    });
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

  MaterialPage createPage({required Widget widget}) =>
      MaterialPage(
          child: Scaffold(
              appBar: AppBar(
                title: Text("New Transaction"),
              ),
              body: widget));
}

class SelectTransactionTypeWidget extends StatelessWidget {

  final Wallet wallet;

  const SelectTransactionTypeWidget({
    Key? key,
    required this.wallet,
  }) : super(key: key);


  @override
  Widget build(BuildContext context) {
    final nav = NewTransactionOverlay.of(context);
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(20),
              child: Text(
                "Where would you like to send the ICP?",
                style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
              ),
            ),
            TextButton(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  "A Canister, as cycles",
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              ),
              onPressed: () {
                nav.pushPage(SelectCanisterPage(wallet: wallet));
                // onTypeSelected(TopUpCanisterPage(wallet: wallet));
              },
            ),
            TextButton(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  "Send to a Wallet",
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              ),
              onPressed: () {
                nav.pushPage(SelectDestinationWalletPage(fromWallet: wallet,));
              },
            ),
            TextButton(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  "Stake a Neuron",
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              ),
              onPressed: () {
                nav.pushPage(StakeNeuronPage(wallet: wallet));
              },
            )
          ],
        ),
      ),
    );
  }
}
