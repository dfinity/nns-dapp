import 'package:nns_dapp/ui/_components/constrain_width_and_center.dart';
import 'package:nns_dapp/ui/_components/footer_gradient_button.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/page_button.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/detail/hardware_list_neurons.dart';
import 'package:nns_dapp/ui/transaction/select_transaction_type_widget.dart';
import 'package:nns_dapp/ui/wallet/transactions_list_widget.dart';
import 'package:universal_html/js.dart' as js;
import 'package:flutter/services.dart';

import '../../nns_dapp.dart';
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
    final account = context.boxes.accounts[widget.account.identifier];
    var buttonGroup = [
      ElevatedButton(
          style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all(AppColors.gray600)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              "Show Principal And Address On Device",
              style: TextStyle(
                  fontSize: Responsive.isMobile(context) ? 14 : 20,
                  fontFamily: Fonts.circularBook,
                  color: AppColors.gray50,
                  fontWeight: FontWeight.w100),
            ),
          ),
          onPressed: () async {
            try {
              final ledgerIdentity =
                  (await context.icApi.connectToHardwareWallet()).unwrap();
              await ledgerIdentity.showAddressAndPubKeyOnDevice();
            } catch (err) {
              // Display the error.
              js.context.callMethod("alert", ["$err"]);
            }
          }),
      if (Responsive.isMobile(context))
        SizedBox(height: 8)
      else
        SizedBox(width: 8),
      Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: ElevatedButton(
              style: ButtonStyle(
                  backgroundColor:
                      MaterialStateProperty.all(AppColors.gray600)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  "Show Neurons",
                  style: TextStyle(
                      fontSize: Responsive.isMobile(context) ? 14 : 20,
                      fontFamily: Fonts.circularBook,
                      color: AppColors.gray50,
                      fontWeight: FontWeight.w100),
                ),
              ),
              onPressed: () async {
                final res = await context
                    .callUpdate(() => context.icApi.fetchNeuronsForHW(account));

                res.when(
                    ok: (neurons) {
                      OverlayBaseWidget.show(
                          context,
                          WizardOverlay(
                              rootTitle: "Neurons",
                              rootWidget: HardwareListNeurons(
                                neurons: neurons,
                              )));
                    },
                    err: (err) => js.context.callMethod("alert", ["$err"]));
              })),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text("Account", style: context.textTheme.headline3),
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
                                                "Address: " +
                                                    account.accountIdentifier,
                                                style: context
                                                    .textTheme.bodyText1)),
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
                                    if (account.hardwareWallet)
                                      SmallFormDivider(),
                                    if (account.hardwareWallet)
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Flexible(
                                            child: SelectableText(
                                                "Principal: " +
                                                    account.principal,
                                                style: context
                                                    .textTheme.bodyText2),
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
                                                    text: account.principal));
                                              }),
                                        ],
                                      ),
                                    SmallFormDivider(),
                                  ],
                                ),
                              ),
                              if (account.hardwareWallet)
                                if (Responsive.isMobile(context))
                                  Column(
                                      // crossAxisAlignment:
                                      //     CrossAxisAlignment.end,
                                      children: buttonGroup)
                                else
                                  Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: buttonGroup),
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
