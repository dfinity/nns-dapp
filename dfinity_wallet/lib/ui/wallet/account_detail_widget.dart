import 'package:dfinity_wallet/ui/_components/constants.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/page_button.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/transaction/select_transaction_type_widget.dart';
import 'package:dfinity_wallet/ui/wallet/transactions_list_widget.dart';
import 'package:flutter/services.dart';

import '../../dfinity.dart';
import 'balance_display_widget.dart';
import '../transaction/wizard_overlay.dart';

class AccountDetailPage extends StatefulWidget {
  final Account account;

  AccountDetailPage(this.account);

  @override
  _AccountDetailPageState createState() => _AccountDetailPageState();
}

class _AccountDetailPageState extends State<AccountDetailPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Account"),
        backgroundColor: AppColors.background,
        actions: [
          if (widget.account.subAccountId != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: TextButton(
                  onPressed: () {
                    OverlayBaseWidget.show(
                        context,
                        TextFieldDialogWidget(
                            title: "Rename Linked Account",
                            fieldName: "New Name",
                            buttonTitle: "Rename",
                            onComplete: (name) async {
                              context.callUpdate(() => context.icApi
                                  .renameSubAccount(
                                      accountIdentifier:
                                          widget.account.identifier,
                                      newName: name));
                            }));
                  },
                  child: Text(
                    "Rename",
                    style: context.textTheme.subtitle2,
                  )),
            )
        ],
      ),
      body: RegularRefreshWidget(
        performRefresh: () => context.icApi.refreshAccount(widget.account),
        child: Container(
            color: AppColors.lightBackground,
            child: StreamBuilder<Object>(
                stream: context.icApi.hiveBoxes.accounts.changes,
                builder: (context, snapshot) {
                  final myLocale = Localizations.localeOf(context);
                  final account =
                      context.boxes.accounts[widget.account.identifier];
                  return FooterGradientButton(
                      body: SingleChildScrollView(
                        child: ConstrainWidthAndCenter(
                          child: Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      account.name,
                                      style: Responsive.isMobile(context)
                                          ? context.textTheme.headline2
                                          : context.textTheme.headline1,
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.only(top: 10.0),
                                      child: BalanceDisplayWidget(
                                        amount: account.balance,
                                        amountSize: Responsive.isMobile(context)
                                            ? 24
                                            : 32,
                                        icpLabelSize: 20,
                                        locale: myLocale.languageCode,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Flexible(
                                          child: SelectableText(
                                              account.accountIdentifier,
                                              style:
                                                  context.textTheme.bodyText2),
                                        ),
                                        IconButton(
                                            constraints: BoxConstraints.tight(
                                                Size.square(20.0)),
                                            padding: const EdgeInsets.all(0),
                                            alignment: Alignment.center,
                                            iconSize: context.textTheme
                                                    .bodyText1?.fontSize ??
                                                24,
                                            icon: Icon(
                                              Icons.copy,
                                              color: context
                                                  .textTheme.bodyText1?.color,
                                            ),
                                            onPressed: () {
                                              Clipboard.setData(ClipboardData(
                                                  text: account
                                                      .accountIdentifier));
                                            }),
                                      ],
                                    ),
                                    SmallFormDivider(),
                                    if (account.hardwareWallet)
                                      Align(
                                        alignment: Alignment.centerLeft,
                                        child: ElevatedButton(
                                            style: ButtonStyle(
                                                backgroundColor:
                                                    MaterialStateProperty.all(
                                                        AppColors.gray600)),
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.all(16.0),
                                              child: Text(
                                                "Show Address And Public Key On Device",
                                                style: TextStyle(
                                                    fontSize:
                                                        Responsive.isMobile(
                                                                context)
                                                            ? 14
                                                            : 20,
                                                    fontFamily:
                                                        Fonts.circularBook,
                                                    color: AppColors.gray50,
                                                    fontWeight:
                                                        FontWeight.w100),
                                              ),
                                            ),
                                            onPressed: () async {
                                              final ledgerIdentity =
                                                  await context.icApi
                                                      .connectToHardwareWallet();

                                              if (ledgerIdentity != null) {
                                                await ledgerIdentity
                                                    .showAddressAndPubKeyOnDevice();
                                              }
                                            }),
                                      ),
                                  ],
                                ),
                              ),
                              if (account.transactions.isEmpty)
                                Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 64),
                                    child: Text(
                                      "No transactions!",
                                      style: context.textTheme.bodyText1,
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ),
                              TransactionsListWidget(account: account),
                              SizedBox(
                                height: 150,
                              )
                            ],
                          ),
                        ),
                      ),
                      footer: Align(
                        alignment: Alignment.bottomCenter,
                        child: PageButton(
                            title: "New Transaction",
                            onPress: () {
                              if (account.hardwareWallet) {
                                OverlayBaseWidget.show(
                                    context,
                                    WizardOverlay(
                                      rootTitle: "Send ICP",
                                      rootWidget:
                                          SelectAccountTransactionTypeWidget(
                                              source: account),
                                    ));
                              } else {
                                OverlayBaseWidget.show(
                                    context,
                                    WizardOverlay(
                                      rootTitle: "Send ICP",
                                      rootWidget:
                                          SelectAccountTransactionTypeWidget(
                                        source: account,
                                      ),
                                    ));
                              }
                            }),
                      ));
                })),
      ),
    );
  }
}
