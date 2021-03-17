import 'package:dfinity_wallet/data/app_state.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_row.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'balance_display_widget.dart';

class WalletsTabWidget extends StatefulWidget {
  @override
  _WalletsTabWidgetState createState() => _WalletsTabWidgetState();
}

class _WalletsTabWidgetState extends State<WalletsTabWidget> {
  static const platformChannel = const MethodChannel('internet_computer.signing');

  @override
  Widget build(BuildContext context) {
    return FooterGradientButton(
        body: TabTitleAndContent(
          title: "Wallets",
          children: [
            SizedBox(
              width: double.infinity,
              child: Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 50),
                  child: BalanceDisplayWidget(
                    amount: AppState.shared.wallets.sumBy((element) => element.balance),
                    amountSize: 60,
                    icpLabelSize: 30,
                  ),
                ),
              ),
            ),
            EitherWidget(
                condition: AppState.shared.wallets.isEmpty,
                trueWidget: Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 100.0),
                    child: SizedBox(
                      width: 400,
                      height: 400,
                      child: Text(
                        "A wallet is used to store ICP. \n\nThis application allows you to manage multiple wallets.  \n\nTap below to create one.",
                        style: context.textTheme.bodyText1,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
                falseWidget: Column(
                  children: [
                    ...AppState.shared.wallets.mapToList((e) => WalletRow(
                          wallet: e,
                        )),
                    SizedBox(
                      height: 120,
                    )
                  ],
                ))
          ],
        ),
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
                                title: "New Wallet",
                                buttonTitle: "Create",
                                fieldName: "Wallet Name",
                                onComplete: (name) {
                                  createWallet(name);
                                }))));
              },
            ),
          ),
        ));
  }

  void createWallet(String name) async {
    var walletAddress = await generateWalletAddress(name);
    if (walletAddress != null) {
      setState(() {
        AppState.shared.wallets.add(Wallet(name, walletAddress));
      });
    }
  }

  Future<String?> generateWalletAddress(String name) async {
    if (kIsWeb) {
      return Uuid().v4();
    } else {
      final walletId = name.replaceAll(" ", "_");
      Map<String, dynamic> response =
          await platformChannel.invokeMapMethod("generateKey", {"walletId": walletId}) ?? {};
      final address = response["publicKey"];
      if (address == null) {
        Map<String, String> error = response["error"] ?? {};
        _showErrorDialog("Error Creating Wallet", "${error['description']}, \n ${error['type']}");
      }
      return address;
    }
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


