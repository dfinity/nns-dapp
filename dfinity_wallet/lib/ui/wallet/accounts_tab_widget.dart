import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/page_button.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_source_wallet_page.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_path_button.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/wallet_router_delegate.dart';
import 'package:flutter/foundation.dart';
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
    return StreamBuilder<Object>(
        stream: context.boxes.accounts.changes,
        builder: (context, snapshot) {
          final wallets = context.boxes.accounts.values;
          final btnSizeGrp = AutoSizeGroup();
          if (wallets.isEmpty) {
            return Container(
              child: Center(
                child: Text("Loading Accounts..."),
              ),
            );
          }
          final myLocale = Localizations.localeOf(context);
          var buttonGroup = [
            PageButton(
              title: "New Transaction",
              onPress: () {
                OverlayBaseWidget.show(
                  context,
                  WizardOverlay(
                    rootTitle: "Select Source Account",
                    rootWidget: SelectSourceWallet(),
                  ),
                );
              },
            ),
            PageButton(
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
                            children: [
                              Text(
                                "Accounts",
                                textAlign: TextAlign.left,
                                style: Responsive.isDesktop(context) |
                                        Responsive.isTablet(context)
                                    ? context.textTheme.headline1
                                    : context.textTheme.headline3,
                              ),
                              BalanceDisplayWidget(
                                amount: wallets.fold(ICP.zero,
                                    (curr, next) => curr + next.balance),
                                amountSize: Responsive.isDesktop(context) |
                                        Responsive.isTablet(context)
                                    ? 40
                                    : 24,
                                icpLabelSize: 25,
                                locale: myLocale.languageCode,
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
                                          AccountPageDef.createPageConfig(e));
                                    },
                                  )),
                          // SizedBox(
                          //   height: 180,
                          // )
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
                  child: Responsive.isDesktop(context)
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [...buttonGroup],
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [...buttonGroup],
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
              // SmalFlFormDivider(),
              SizedBox(height: 24.0),
              WizardPathButton(
                  title: "Attach Hardware Wallet",
                  subtitle: "Coming Soon...",
                  onPressed: () {
                    WizardOverlay.of(context).pushPage(
                        "Enter Wallet Name", HardwareWalletNameWidget());
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
