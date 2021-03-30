import 'dart:async';

import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/resource_orchstrator.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/wallet/transaction_row.dart';
import 'package:dfinity_wallet/ui/wallet/transactions_list_widget.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';
import '../transaction/create_transaction_overlay.dart';

class WalletDetailPage extends StatefulWidget {
  final Wallet wallet;

  WalletDetailPage(this.wallet);

  @override
  _WalletDetailPageState createState() => _WalletDetailPageState();
}

class _WalletDetailPageState extends State<WalletDetailPage> {
  OverlayEntry? _overlayEntry;

  StreamSubscription? subs;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    subs?.cancel();
    subs = context.boxes.wallets.watch(key: widget.wallet.address).listen((event) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    super.dispose();
    subs?.cancel();
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text("Wallet"),
        backgroundColor: AppColors.background,
      ),
      body: Container(
          color: AppColors.lightBackground,
          child: FooterGradientButton(
              body: ListView(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          widget.wallet.name,
                          style: context.textTheme.headline1,
                        ),
                      ),
                    ),
                  ),
                  Padding(
                      padding: EdgeInsets.all(24),
                      child: BalanceDisplayWidget(
                        amount: widget.wallet.icpBalance,
                        amountSize: 40,
                        icpLabelSize: 25,
                      )),
                  TransactionsListWidget(wallet: widget.wallet),
                  SizedBox(
                    height: 200,
                  )
                ],
              ),
              footer: Padding(
                padding: const EdgeInsets.all(8.0),
                child: ElevatedButton(
                    child: Text(
                      "New Transaction",
                      style: context.textTheme.button?.copyWith(fontSize: 24),
                    ),
                    onPressed: () {
                      _overlayEntry = _createOverlayEntry();
                      Overlay.of(context)?.insert(_overlayEntry!);
                    }),
              ))),
    );
  }

  OverlayEntry _createOverlayEntry() {
    final parentContext = this.context;
    return OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
          parentContext: parentContext,
          overlayEntry: _overlayEntry,
          child: NewTransactionOverlay(
            source: widget.wallet,
          ));
    });
  }
}
