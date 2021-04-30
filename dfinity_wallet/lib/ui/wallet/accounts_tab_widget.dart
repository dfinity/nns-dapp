import 'dart:async';
import 'dart:math';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/wallet/account_actions_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:dfinity_wallet/ui/wallet/sub_accounts_list_widget.dart';
import 'package:dfinity_wallet/ui/wallet/transactions_list_widget.dart';
import 'package:dfinity_wallet/wallet_router_delegate.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'account_row.dart';
import 'attach_hardware_wallet.dart';
import 'balance_display_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';

class AccountsTabWidget extends StatefulWidget {
  @override
  _AccountsTabWidgetState createState() => _AccountsTabWidgetState();
}

class _AccountsTabWidgetState extends State<AccountsTabWidget> {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.accounts.watch(),
        builder: (context, snapshot) {
          final wallets = context.boxes.accounts.values;
          if (wallets.isEmpty) {
            return Container(
              child: Center(
                child: Text("Loading Accounts..."),
              ),
            );
          }
          final primary = context.boxes.accounts.maybePrimary;
          final subAccounts = context.boxes.accounts.subAccounts;
          final hardwareWallets = context.boxes.accounts.hardwareWallets;
          final maxListItems = max(subAccounts.length +1, hardwareWallets.length);

          return FooterGradientButton(
              footerHeight: null,
              body: DefaultTabController(
                length: 2,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                  ConstrainWidthAndCenter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Accounts",
                                  textAlign: TextAlign.left,
                                  style: context.textTheme.headline1,
                                ),
                              ],
                            ),
                          ),
                          BalanceDisplayWidget(
                              amount: wallets.sumBy((element) => element.icpBalance),
                              amountSize: 40,
                              icpLabelSize: 20),
                        ],
                      ),
                    ),
                  ),
                  SmallFormDivider(),
                      ConstrainWidthAndCenter(
                    child: Column(
                      children: [
                        Container(
                          color: AppColors.transparent,
                          child: Row(
                            children: [
                              TabBar(
                                  indicatorColor: Colors.white,
                                  overlayColor: MaterialStateProperty.all(
                                      AppColors.lightBackground),
                                  isScrollable: true,
                                  tabs: [
                                    Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Tab(text: "SUB-ACCOUNTS"),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Tab(text: "HARDWARE WALLETS"),
                                    )
                                  ]),
                              // Expanded(flex: 1, child: Container())
                            ],
                          ),
                        ),
                        SmallFormDivider(),
                        SizedBox(
                          height: 100 + (maxListItems * 150),
                          child: TabBarView(
                            children: [
                              SubAccountsListWidget(
                                subAccounts: [context.boxes.accounts.primary, ...context.boxes.accounts.subAccounts],
                                buttonTitle: "Create Sub-Account",
                                buttonAction: (){
                                  OverlayBaseWidget.show(context, TextFieldDialogWidget(
                                      title: "New Sub-Account",
                                      buttonTitle: "Create",
                                      fieldName: "Account Name",
                                      onComplete: (name) {
                                        context.performLoading(() => context.icApi.createSubAccount(name: name));
                                      }), borderRadius: 20);
                                },
                              ),
                              SubAccountsListWidget(
                                subAccounts:
                                context.boxes.accounts.hardwareWallets,
                                buttonTitle: "Attach Hardware Wallet",
                                buttonAction: (){
                                  // OverlayBaseWidget.show(context, AttachHardwareWalletWidget());
                                },
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 180,
                  )
                    ],
                  ),
                ),
              ),
              footer: Container());
        });
  }
}

