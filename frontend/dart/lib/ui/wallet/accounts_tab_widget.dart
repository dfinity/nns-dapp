import 'package:flutter/foundation.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/constrain_width_and_center.dart';
import 'package:nns_dapp/ui/_components/footer_gradient_button.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/page_button.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/transaction/wallet/select_source_wallet_page.dart';
import 'package:nns_dapp/ui/transaction/wizard_overlay.dart';
import 'package:nns_dapp/ui/transaction/wizard_path_button.dart';
import 'package:nns_dapp/data/env.dart' as env;
import 'package:universal_html/html.dart' as html;
import '../../nns_dapp.dart';
import 'account_row.dart';
import 'balance_display_widget.dart';

import 'hardware_wallet_name_widget.dart';

class AccountsTabWidget extends StatefulWidget {
  @override
  _AccountsTabWidgetState createState() => _AccountsTabWidgetState();
}

class _AccountsTabWidgetState extends State<AccountsTabWidget> {
  @override
  Widget build(BuildContext context) {
    if (!env.showAccountsRoute()) {
      html.window.location.replace("/v2/#/accounts");
      return Text('Redirecting...');
    }
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

          var buttonGroup = [
            Flexible(
              child: PageButton(
                title: "New Transaction",
                onPress: () {
                  OverlayBaseWidget.show(
                    context,
                    WizardOverlay(
                      rootTitle: "Select Source Account",
                      rootWidget: SelectSourceWallet(isStakeNeuron: false),
                    ),
                  );
                },
              ),
            ),
            Flexible(
              child: PageButton(
                title: "Add Account",
                onPress: () {
                  OverlayBaseWidget.show(
                    context,
                    WizardOverlay(
                      rootTitle: "Add Account",
                      rootWidget: SelectAccountAddActionWidget(),
                    ),
                  );
                },
              ),
            ),
          ];
          return FooterGradientButton(
              footerHeight: null,
              body: DefaultTabController(
                length: 2,
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: ConstrainWidthAndCenter(
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                "Accounts",
                                textAlign: TextAlign.left,
                                style: context.textTheme.headline1,
                              ),
                              BalanceDisplayWidget(
                                amount: wallets.fold(ICP.zero,
                                    (curr, next) => curr + next.balance),
                                amountSize:
                                    Responsive.isMobile(context) ? 24 : 32,
                                icpLabelSize: 25,
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 40,
                          ),
                          ...wallets
                              .sortedBy((element) => element.primary ? 0 : 1)
                              .thenBy((element) => element.name)
                              .mapToList((e) => AccountRow(
                                    account: e,
                                    onTap: () {
                                      context.nav.push(
                                          accountPageDef.createPageConfig(e));
                                    },
                                  )),
                          SizedBox(
                            height: 180,
                          )
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              footer: Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [...buttonGroup],
                    )),
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
              WizardPathButton(
                  title: "New Linked-Account",
                  subtitle: "Create a new linked account",
                  onPressed: () {
                    // StringFieldValidation.maximumLength(24)
                    WizardOverlay.of(context).pushPage(
                        "New Linked Account",
                        Center(
                          child: TextFieldDialogWidget(
                              title: "New Linked Account",
                              buttonTitle: "Create",
                              fieldName: "Account Name",
                              onComplete: (name) {
                                context.callUpdate(() =>
                                    context.icApi.createSubAccount(name: name));
                              }),
                        ));
                  }),
              SmallFormDivider(),
              WizardPathButton(
                  title: "Attach Hardware Wallet",
                  subtitle: "Link a hardware wallet to this account",
                  onPressed: () {
                    WizardOverlay.of(context).pushPage(
                        "Enter Wallet Name", HardwareWalletNameWidget());
                  }),
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
