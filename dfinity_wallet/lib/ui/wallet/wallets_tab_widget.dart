import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/data/wallet.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';
import 'package:dfinity_wallet/ui/wallet/wallet_detail_widget.dart';

class WalletsTabWidget extends StatefulWidget {
  @override
  _WalletsTabWidgetState createState() => _WalletsTabWidgetState();
}

class _WalletsTabWidgetState extends State<WalletsTabWidget> {
  List<Wallet> wallets = [];

  @override
  void initState() {
    super.initState();
    wallets = 0.rangeTo(3).mapToList((e) => WalletService.demoWallet());
  }

  @override
  Widget build(BuildContext context) {
    return TabTitleAndContent(
      title: "Wallets",
      content: Column(
        children: wallets.mapToList((e) => WalletRow(
          wallet: e,
        )),
      ),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  wallet.name, style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left:16.0, bottom: 16.0, right: 16.0),
                child: Text(wallet.publicKey, style: context.textTheme.bodyText2?.copyWith(color: AppColors.gray800),),
              )
            ],
          ),
        ),
      ),
    );
  }
}
