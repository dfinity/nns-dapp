import 'package:dfinity_wallet/data/app_state.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/conditional_widget.dart';
import 'package:dfinity_wallet/ui/_components/debounced_validated_form_field.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/_components/text_field_dialog_widget.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';
import '../_components/debounced_validated_form_field.dart';

class WalletsTabWidget extends StatefulWidget {
  @override
  _WalletsTabWidgetState createState() => _WalletsTabWidgetState();
}

class _WalletsTabWidgetState extends State<WalletsTabWidget> {



  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: TabTitleAndContent(
            title: "Wallets",
            children: [EitherWidget(
                    condition: AppState.shared.wallets.isEmpty,
                    trueWidget: Center(
                  child: Padding(
                    padding:  EdgeInsets.symmetric(vertical: 100.0),
                    child: SizedBox(
                      width: 400,
                      height: 400,
                      child: Text(
                        "A wallet is used to store ICP. \n\nThis application allows you to manage multiple wallets.  Tap below to create one.",
                        style: context.textTheme.bodyText1,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
                falseWidget: Column(
                  children: AppState.shared.wallets.mapToList((e) => WalletRow(
                        wallet: e,
                      )),
                ))],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(8.0),
          color: AppColors.gray600,
          child: SizedBox(
            height: 80,
            width: double.infinity,
            child: ElevatedButton(
              child: Text(
                "New Wallet",
                style: context.textTheme.bodyText1?.copyWith(fontSize: 24),
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
                                  setState(() {
                                    AppState.shared.wallets.add(Wallet(name, WalletService.uuid.v4()));
                                  });
                                }))));
              },
            ),
          ),
        )
      ],
    );
  }
}

class WalletRow extends StatelessWidget {
  final Wallet wallet;

  const WalletRow({Key? key, required this.wallet}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: () {
          context.push(WalletDetailWidget(wallet: wallet));
        },
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  wallet.name,
                  style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  wallet.publicKey,
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
