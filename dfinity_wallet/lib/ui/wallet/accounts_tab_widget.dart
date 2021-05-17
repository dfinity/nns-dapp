import 'dart:async';
import 'dart:math';

import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_source_wallet_page.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_path_button.dart';
import 'package:dfinity_wallet/ui/wallet/account_actions_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/account.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
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

import 'hardware_wallet_name_widget.dart';

class AccountsTabWidget extends StatefulWidget {
  @override
  _AccountsTabWidgetState createState() => _AccountsTabWidgetState();
}

class _AccountsTabWidgetState extends State<AccountsTabWidget> {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Object>(
        stream: context.boxes.accounts.changes,
        builder: (context, snapshot) {
          final wallets = context.boxes.accounts.values;
          if (wallets.isEmpty) {
            return Container(
              child: Center(
                child: Text("Loading Accounts..."),
              ),
            );
          }
          final subAccounts = context.boxes.accounts.subAccounts;
          final hardwareWallets = context.boxes.accounts.hardwareWallets;
          return FooterGradientButton(
              footerHeight: null,
              body: DefaultTabController(
                length: 2,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ConstrainWidthAndCenter(
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 24.0),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.all(16.0),
                                          child: Text(
                                            "Accounts",
                                            textAlign: TextAlign.left,
                                            style: context.textTheme.headline1,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: BalanceDisplayWidget(
                                        amount: wallets
                                            .sumBy((element) => element.icpBalance),
                                        amountSize: 40,
                                        icpLabelSize: 20),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(
                              height: 40,
                            ),
                            ...wallets.sortedBy((element) => element.primary ? 0 : 1)
                                .thenBy((element) => element.name)
                                .mapToList((e) => AccountRow(
                              account: e,
                              onTap: () {
                                context.nav.push(AccountPageDef.createPageConfig(e));
                              },
                            )),
                            SizedBox(
                              height: 180,
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              footer:  Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: SizedBox(
                            child: Text(
                              "New Transaction",
                              textAlign: TextAlign.center,
                              style: context.textTheme.button?.copyWith(fontSize: 24),
                            ),
                          ),
                        ),
                        onPressed: () {
                          OverlayBaseWidget.show(
                              context,
                              WizardOverlay(
                                rootTitle: "Select Source Account",
                                rootWidget: SelectSourceWallet(),
                              ));
                        },
                      ),
                      ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: SizedBox(
                            child: Text(
                              "Add Account",
                              textAlign: TextAlign.center,
                              style: context.textTheme.button?.copyWith(fontSize: 24),
                            ),
                          ),
                        ),
                        onPressed: () {
                          OverlayBaseWidget.show(
                              context,
                              WizardOverlay(
                                rootTitle: "Add Account",
                                rootWidget: SelectAccountAddActionWidget(),
                              ));
                        },
                      ),
                    ],
                  ),
                ),
              ));
        });
  }
}


class SelectAccountAddActionWidget extends StatelessWidget {
  const SelectAccountAddActionWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Center(
        child: IntrinsicWidth(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              WizardPathButton(title: "New Linked-Account",
                  subtitle: "Create a new linked account",
                  onPressed: () {
                    // StringFieldValidation.maximumLength(24)
                    WizardOverlay.of(context).pushPage(
                        "New Linked Account", Center(
                          child: TextFieldDialogWidget(
                          title: "New Linked Account",
                          buttonTitle: "Create",
                          fieldName: "Account Name",
                          onComplete: (name) {
                            context.callUpdate(() =>
                                context
                                    .icApi
                                    .createSubAccount(
                                    name: name));
                          }),
                        ));
                  }),
              SmallFormDivider(),
              WizardPathButton(title: "Attach Hardware Wallet",
                  subtitle: "Coming Soon...",
                  onPressed: () {
                    WizardOverlay.of(context)
                        .pushPage("Enter Wallet Name", HardwareWalletNameWidget());
                  }.takeIf((e) => false)),
              SmallFormDivider(),
              SizedBox(
                height: 50,
              )
            ],
          ),
        ),
      ),
    );
  }
}
