import 'dart:async';
import 'dart:math';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/wallet/account_actions_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:dfinity_wallet/ui/wallet/transactions_list_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_row.dart';
import 'package:dfinity_wallet/wallet_router_delegate.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'balance_display_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';

class AccountsTabWidget extends StatefulWidget {
  @override
  _AccountsTabWidgetState createState() => _AccountsTabWidgetState();
}

class _AccountsTabWidgetState extends State<AccountsTabWidget> {
  StreamSubscription? walletsSubscription;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    walletsSubscription?.cancel();
    walletsSubscription = context.boxes.wallets.watch().listen((event) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final wallets = context.boxes.wallets.values;
    if (wallets.isEmpty) {
      return Container(
        child: Center(
          child: Text("Loading Accounts..."),
        ),
      );
    }
    final primary = context.boxes.wallets.maybePrimary;
    final subAccounts = context.boxes.wallets.subAccounts;
    final maxListItems =
        max(subAccounts.length, primary?.transactions.length ?? 0);
    return FooterGradientButton(
        footerHeight: null,
        body: DefaultTabController(
          length: 2,
          child: SingleChildScrollView(
            child: ConstrainWidthAndCenter(
                child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Account",
                                textAlign: TextAlign.left,
                                style: context.textTheme.headline2,
                              ),
                              SizedBox(
                                height: 10,
                              ),
                              SelectableText(
                                primary?.accountIdentifier ?? "",
                                style: context.textTheme.bodyText2,
                              )
                            ],
                          ),
                        ),
                      ),
                      BalanceDisplayWidget(
                          amount: primary?.icpBalance ?? 0,
                          amountSize: 40,
                          icpLabelSize: 20)
                    ],
                  ),
                ),
                SmallFormDivider(),
                Container(
                  color: AppColors.lighterBackground,
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TabBar(indicatorColor: Colors.white, tabs: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Tab(text: "SUBACCOUNTS"),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Tab(text: "TRANSACTION HISTORY"),
                          ),
                        ]),
                      ),
                      Expanded(flex: 1, child: Container())
                    ],
                  ),
                ),
                SmallFormDivider(),
                SizedBox(
                  height: maxListItems * 200,
                  child: TabBarView(
                    children: [
                      SubAccountsListWidget(
                        subAccounts: context.boxes.wallets.subAccounts,
                      ),
                      TransactionsListWidget(
                        wallet: primary,
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  height: 180,
                )
              ],
            )),
          ),
        ),
        footer: EitherWidget(
          condition: primary != null,
          trueWidget: AccountActionsWidget(
            primaryWallet: primary!,
          ),
          falseWidget: Container(),
        ));
  }

  Future<void> _showErrorDialog(String title, String desc) async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(desc),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Ok'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
    walletsSubscription?.cancel();
  }
}

class SubAccountsListWidget extends StatelessWidget {
  final List<Wallet> subAccounts;

  const SubAccountsListWidget({Key? key, required this.subAccounts})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: subAccounts.mapToList((e) => WalletRow(
            wallet: e,
            onTap: () {
              context.nav.push(WalletPageDef.createPageConfig(e));
            },
          )),
    );
  }
}
