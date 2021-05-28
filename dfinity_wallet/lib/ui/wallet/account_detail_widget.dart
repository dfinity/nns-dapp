import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
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
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(24.0),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          AutoSizeText(
                                            account.name,
                                            maxLines: 1,
                                            style: context.textTheme.headline1,
                                          ),
                                          SizedBox(
                                            height: 10,
                                          ),
                                          Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Expanded(
                                                  flex: 2,
                                                  child: IconButton(
                                                      constraints:
                                                          BoxConstraints.tight(
                                                              Size.square(
                                                                  20.0)),
                                                      padding:
                                                          const EdgeInsets.all(
                                                              0),
                                                      alignment:
                                                          Alignment.center,
                                                      iconSize: context
                                                              .textTheme
                                                              .bodyText1
                                                              ?.fontSize ??
                                                          24,
                                                      icon: Icon(
                                                        Icons.copy,
                                                        color: context.textTheme
                                                            .bodyText1?.color,
                                                      ),
                                                      onPressed: () {
                                                        Clipboard.setData(
                                                            ClipboardData(
                                                                text: account
                                                                    .accountIdentifier));
                                                      })),
                                              Expanded(
                                                flex: 12,
                                                child: AutoSizeText(
                                                  account.accountIdentifier,
                                                  style: context
                                                      .textTheme.bodyText2,
                                                  selectable: true,
                                                  maxLines: 2,
                                                ),
                                              ),
                                            ],
                                          ),
                                          SmallFormDivider(),
                                          if (account.hardwareWallet)
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: ElevatedButton(
                                                  style: ButtonStyle(
                                                      backgroundColor:
                                                          MaterialStateProperty
                                                              .all(AppColors
                                                                  .gray600)),
                                                  child: Padding(
                                                    padding:
                                                        const EdgeInsets.all(
                                                            16.0),
                                                    child: Text(
                                                      "Show Address And Public Key On Device",
                                                      style: TextStyle(
                                                          fontSize: 20,
                                                          fontFamily: Fonts
                                                              .circularBook,
                                                          color:
                                                              AppColors.gray50,
                                                          fontWeight:
                                                              FontWeight.w100),
                                                    ),
                                                  ),
                                                  onPressed: () async {
                                                    final ledgerIdentity =
                                                        await context.icApi
                                                            .connectToHardwareWallet();
                                                    final hardwareWalletApi =
                                                        await context.icApi
                                                            .createHardwareWalletApi(
                                                                ledgerIdentity:
                                                                    ledgerIdentity);
                                                    hardwareWalletApi
                                                        .showAddressAndPubKeyOnDevice();
                                                  }),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Padding(
                                      padding: EdgeInsets.all(24),
                                      child: BalanceDisplayWidget(
                                        amount: account.balance,
                                        amountSize: 40,
                                        icpLabelSize: 25,
                                        locale: myLocale.languageCode,
                                      )),
                                ],
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
                                height: 200,
                              )
                            ],
                          ),
                        ),
                      ),
                      footer: Center(
                        child: ElevatedButton(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: AutoSizeText(
                                "New Transaction",
                                style: context.textTheme.button
                                    ?.copyWith(fontSize: 24),
                              ),
                            ),
                            onPressed: () {
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
