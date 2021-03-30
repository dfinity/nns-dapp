import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/ui/home/nodes/node_world.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_row.dart';
import 'package:dfinity_wallet/wallet_router_delegate.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'balance_display_widget.dart';
import 'package:dfinity_wallet/dfinity.dart';

class WalletsPage extends StatefulWidget {
  @override
  _WalletsPageState createState() => _WalletsPageState();
}

class _WalletsPageState extends State<WalletsPage> {
  @override
  Widget build(BuildContext context) {
    final wallets = context.boxes.wallets.values;
    if(wallets.isEmpty){
      return NodeWorld();
    }
    final primary = wallets.primary;
    return FooterGradientButton(
        body: ConstrainWidthAndCenter(
            child: ListView(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        "Account",
                        style: context.textTheme.headline2,
                      ),
                      Text(
                        primary.key,
                        style: context.textTheme.bodyText1,
                      )
                    ],
                  ),
                ),
                BalanceDisplayWidget(
                    amount: primary.icpBalance,
                    amountSize: 50,
                    icpLabelSize: 30)
              ],
            ),
            Card(
              color: AppColors.black,
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  "A wallet is used to store ICP. \n\nThis application allows you to manage multiple wallets.  \n\nTap below to create one.",
                  style: context.textTheme.bodyText1,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            SmallFormDivider(),
            ...context.boxes.wallets.values.map((e) => WalletRow(
                  wallet: e,
                  onTap: () {
                    context.nav.push(WalletPageDef.createPageConfig(e));
                  },
                )),
            SizedBox(
              height: 120,
            )
          ],
        )),
        footer: Container(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            height: 80,
            width: double.infinity,
            child: ElevatedButton(
              child: Text(
                "Create New Wallet",
                style: context.textTheme.button?.copyWith(fontSize: 24),
              ),
              onPressed: () {
                showDialog(
                    context: context,
                    builder: (context) => Center(
                        child: SizedBox(
                            width: 500,
                            child: TextFieldDialogWidget(
                                title: "New Sub Account",
                                buttonTitle: "Create",
                                fieldName: "Account Name",
                                onComplete: (name) {
                                  createSubAccount(name);
                                }))));
              },
            ),
          ),
        ));
  }

  void createSubAccount(String name) async {
    await context.performLoading(() => context.icApi.createSubAccount(name));
    setState(() {});
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
}
